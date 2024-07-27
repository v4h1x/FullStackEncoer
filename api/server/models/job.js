// In the name of God
'use strict';

import pkg from 'sqlstring-sqlite';
const { escapeId, escape } = pkg;
import sqlite3 from 'sqlite3';
var db
import JobController from './jobController.js';
import Common from '../common/common.js';

import logger from '../logger.js'

function getConnection() {
    if (!db)
    {
        db = new sqlite3.Database('main.sqlite');
        db.configure('busyTimeout', 10000);
    }
    return db;
}

class Job {

    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }

    static async countAll(filters) {
        let query = 'select count(*) as total from jobs';
        if (filters && Object.keys(filters).length > 0)
            query = query + ' where ' + Object.keys(filters).map(k => {
                if (k === 'name')
                    return `${escapeId(k)} like '${filters[k]}%'`
                return `${escapeId(k)} = '${filters[k]}'`;
            }).join(' and ');
        return new Promise((resolve, reject) => {
            getConnection().get(query, [], (error, row) => {
                if (error)
                    reject(error);
                resolve(row.total);
            });
        })
            .catch((error) => Promise.reject(error));

    }

    static async fetchJobs(start, limit, sortColumn, sortOrder, filters) {
        let query = 'select * from jobs';
        if (filters && Object.keys(filters).length > 0)
            query = query + ' where ' + Object.keys(filters).map(k => {
                if (k === 'name')
                    return `${escapeId(k)} like '${filters[k]}%'`
                return `${escapeId(k)} = '${filters[k]}'`;
            }).join(' and ');
        if (sortColumn && sortOrder)
            query = query + ' order by ' + escapeId(sortColumn) + ' ' + sortOrder;
        if (start && limit)
            query = query + ' limit ' + escape(start) + ',' + escape(limit);
        let promise = new Promise((resolve, reject) => {
            getConnection().all(query, (error, rows) => {
                if (error)
                    reject(error);
                let jobs = [];
                if (rows)
                    rows.forEach(row => jobs.push(new Job(row)));
                resolve(jobs);
            });
        });
        return promise
            .then((jobs) => {
                return JobController.fetchGpuMemUsage()
                    .then(() => Promise.resolve(jobs))
            })
            .then((jobs) => {
                const promises = []
                jobs.forEach(async job => {
                    promises.push(JobController.fetchJobStats(job));
                });
                return Promise.all(promises);
            })
            .catch((error) => Promise.reject(error));
    }

    static async fetchJob(job_id) {
        let promise = new Promise((resolve, reject) => {
            getConnection().get('select * from jobs where id = ?', job_id, (error, row) => {
                if (error)
                    reject(error);
                const job = new Job(row);
                resolve(job);
            });
        });
        return promise
            .then((job) => JobController.fetchJobStats(job))
            .then((job) => job)
            .catch((error) => Promise.reject(error));
    }

    static async fetchJobByName(name) {
        let promise = new Promise((resolve, reject) => {
            getConnection().get('select * from jobs where name = ?', name, (error, row) => {
                if (error)
                    reject(error);
                if (row)
                    resolve(new Job(row));
                resolve(null);
            });
        });
        return promise
            .then((job) => job ? JobController.fetchJobStats(job) : Promise.resolve())
            .then((job) => Promise.resolve(job))
            .catch((error) => Promise.reject(error));
    }

    static async fetchUserJobs(user_id) {
        let promise = new Promise((resolve, reject) => {
            getConnection().all('select * from jobs where user_id = ?', user_id, (error, rows) => {
                if (error)
                    reject(error);
                let jobs = [];
                rows.forEach(row => jobs.push(new Job(row)));
                resolve(jobs);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async insert(job) {
        let promise = new Promise((resolve, reject) => {

            var stmt = getConnection().prepare('INSERT INTO jobs (name, type, command, status, date_added, user_id) VALUES(?, ?, ?, ?, ?, ?);');
            stmt.run(job.name, job.type, job.command, job.status, new Date().toISOString(), job.user_id, (error) => {
                if (error)
                    reject(error);
                resolve(stmt.lastID);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async update(job) {

        return JobController.delete(job)
            .then(data => new Promise((resolve, reject) => {

                const sql = 'UPDATE jobs SET name = ?, type = ?, command = ? WHERE id = ?';
                getConnection().run(sql, job.name, job.type, job.command, job.id, (error) => {
                    if (error)
                        return reject(error);
                    resolve(null);
                });
            }))
            .catch(error => Promise.reject(error));

    }

    static async changeStatus(job) {
        let promise = new Promise((resolve, reject) => {

            const sql = 'UPDATE jobs SET status = ? WHERE id = ?';
            getConnection().run(sql, job.status, job.id, (error) => {
                if (error)
                    reject(error);
                resolve(null);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async delete(jobId) {
        return this.fetchJob(jobId)
            .then(job => JobController.delete(job))
            .then(data => new Promise((resolve, reject) => {

                const sql = 'DELETE FROM jobs WHERE id = ?';
                getConnection().run(sql, jobId, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(null);
                });
            }))
            .catch(error => Promise.reject(error));

    }

    static async start(job, rnuCallback, errorHandler) {
        let stopCallback = async (j) => {
            j.status = Common.JobStatus.STOPPED;
            await this.changeStatus(j);
            logger.info('Job ' + job.name + ' stopped.');
        };
        let startCallback = async (j) => {
            j.status = Common.JobStatus.RUNNING;
            await this.changeStatus(j);
            rnuCallback();
        };
        JobController.start(job, startCallback, stopCallback, errorHandler);
    }

    static async stop(job) {
        return JobController.stop(job)
            .then(() => {
                job.status = Common.JobStatus.STOPPED;
                return this.changeStatus(job);
            })
            .catch(error => Promise.reject(error));
    }

    static async attach(job) {
        return JobController.attach(job)
            .catch(error => Promise.reject(error));
    }

    static async detach(job) {
        return JobController.detach(job)
            .catch(error => Promise.reject(error));
    }

    static async getLogStream(job) {
        return JobController.fetchLogStream(job)
            .catch(error => Promise.reject(error));
    }

    static async getLog(job) {
        return JobController.fetchLog(job)
            .catch(error => Promise.reject(error));
    }

    static async syncJobs() {
        let jobs = await Job.fetchJobs()
        for (let job of jobs) {
            let status = await JobController.fetchJobStatus(job);
            if (status !== job.status) {
                job.status = status;
                await this.changeStatus(job);
            }
            if (job.status === Common.JobStatus.RUNNING) {
                await JobController.attachForOutput(job);
                await JobController.getParentPid(job);
            }
        }
    }

    static async initialize() {
        try {
            console.log('job initializie')
            await Job.syncJobs();
            let inputs = await JobController.fetchAvailableDeckLinkInputs();
            console.log(inputs);
        }
        catch (error) {
            console.log(error)
        }
    }
}


export default Job;