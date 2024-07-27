// In the name of God

import Common from '../common/common.js';
import Job from '../models/job.js';
import sqlite3 from 'sqlite3'

beforeAll(() => {
    let db = new sqlite3.Database('main.sqlite');
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM jobs WHERE name in ('test', 'test2')", [], (error) => {
            if (error)
                reject(error);
            resolve();
        });
    })
});

test('Should throw error because job does not have name', async () => {
    let job = { command:'-i a.mp4 o.mp4', type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    expect(Job.insert(job)).rejects.toBeTruthy();
});

test('Should throw error because job does not have command', async () => {
    let job = { name:'test', type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    expect(Job.insert(job)).rejects.toBeTruthy();
});

test('Should throw error because job does not have user_id', async () => {
    let job = { name:'test', command:'-i a.mp4 o.mp4', type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    expect(Job.insert(job)).rejects.toBeTruthy();
});

test('Should insert a job in the database', async () => {
    let job = { name:'test', command:'-i a.mp4 o.mp4', user_id:1, type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    let jobId = await Job.insert(job);
    expect(jobId).toBeGreaterThan(0)
});

test('Should not insert a duplicate job name in the database', async () => {
    let job = { name:'test', command:'-i a.mp4 -c:v libx265 o.mp4', user_id:1, type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    expect(Job.insert(job)).rejects.toBeTruthy()
});


test('Should insert the second job in the database', async () => {
    let job = { name:'test2', command:'-i a.mp4 -c:v libx265 o.mp4', user_id:1, type:Common.JobType.CPU, status:Common.JobStatus.STOPPED };
    let jobId = await Job.insert(job);
    expect(jobId).toBeGreaterThan(0)
});

test('Should return 2 jobs', async ()=>{
  let jobs = await Job.fetchJobs();
  expect(jobs).toHaveLength(2);
})

test('Count all jobs. Should return 2', async ()=>{
  let total = await Job.countAll();
  expect(total).toStrictEqual(2);
})

test('Should fetch user test2', async ()=>{
    let test2 = await Job.fetchJobByName('test2');
    expect(test2.name).toStrictEqual('test2');
    expect(test2.command).toStrictEqual('-i a.mp4 -c:v libx265 o.mp4');
})

test('Should delete job test2', async ()=>{
    let test2 = await Job.fetchJobByName('test2');
    await Job.delete(test2.id);
    expect(Job.fetchJobByName('test2')).resolves.toBeUndefined();
})