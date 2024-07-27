// In the name of God
'use strict';

import sqlite3 from 'sqlite3';
var db;
import SystemInfo from './system.js';
import { CronJob } from 'cron';

const INTERVAL = 5000;
const GROUPS = {
    minute: '%Y-%m-%d-%H-%M',
    hour: '%Y-%m-%d-%H',
    day: '%Y-%m-%d',
    month: '%Y-%m',
}

function getConnection() {
    if (!db) {
        db = new sqlite3.Database('telemetry.sqlite');
        db.configure('busyTimeout', 10000);
    }
    return db;
}

class Telemetry {

    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }

    static async fetchTelemetries(start, end, categories, group) {
        let query = '';
        let where = ' where '
        if (categories.length > 0)
            where = where + '(' + categories.map(category => ' category = ?').join(' OR ') + ')'
        if (categories.length > 0)
            where = where + ' and ';
        where = where + (start ? ' ts between ? and ?' : ' and ts < ?');

        if (group) {
            query = query + `select ts as timestamp, category, name, avg(value) as data from telemetry`;
            query = query + where + `group by strftime('${GROUPS[group]}', ts, 'unixepoch', 'localtime'), category, name`
        }
        else {
            query = query + 'select ts as timestamp, category, name, value as data from telemetry' + where;
        }
        return new Promise((resolve, reject) => {
            getConnection().all(query, [...categories, start, end], (error, rows) => {
                if (error)
                    reject(error);
                let data = [];
                if (rows)
                    rows.forEach(row => data.push(new Telemetry(row)));
                resolve(data);
            });
        }).catch(error => Promise.reject(error));
    }


    static async insert(telemetry) {
        let promise = new Promise((resolve, reject) => {

            var stmt = getConnection().prepare('INSERT INTO telemetry (ts, name, category, value) VALUES(?, ?, ?, ?);');
            stmt.run(telemetry.ts, telemetry.name, telemetry.category, telemetry.value, (error) => {
                if (error)
                    reject(error);
                resolve(stmt.lastID);
            });
        });
        return promise;
    }

    static async delete(start, end, categories) {

        return new Promise((resolve, reject) => {
            let where = ' where '
            if (categories.length > 0)
                where = where + '(' + categories.map(category => ' category = ?').join(' OR ') + ')'
            if (categories.length > 0)
                where = where + ' and ';
            where = where + (start ? ' ts between ? and ?' : ' and ts < ?');
            let query = 'DELETE from telemetry' + where;

            let parameters = [...categories]
            if (start)
                parameters.push(start);
            parameters.push(end);
            getConnection().run(query, [...categories, start, end], (error) => {
                reject(error);
            });
            resolve(null);
        });
    }

    static async collectSystemMetrics() {
        let metrics = await SystemInfo.getMetrics();
        const ts = Math.floor(Date.now() / 1000);
        for (const [category, c] of Object.entries(metrics))
            for (const [key, value] of Object.entries(c)) {
                // console.log(`${key}: ${value}`);
                if (value)
                    await Telemetry.insert({ ts: ts, name: key, category: category, value: value });
            }
        setTimeout(Telemetry.collectSystemMetrics, INTERVAL);
    }

    static async purgeOldTelemetries() {
        var job = new CronJob(
            '0 0 0 1 0 *',
            async function () {
                let end = Date.now();
                let start = new Date(end);
                start.setMinutes(start.getMinutes() - 1);

                await Telemetry.delete(Math.floor(start.getTime() / 1000),
                    Math.floor(end / 1000), []);
                console.log('telemetries cleaned.')
            },
            null,
            true
        );
    }

}



export default Telemetry;