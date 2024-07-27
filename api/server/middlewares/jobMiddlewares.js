// In the name of God

import Common from '../common/common.js';
import Job from '../models/job.js';

export async function ensureRunning (req, res, next) {
    let jobId = req.params.id;
    let job = await Job.fetchJob(jobId);
    if (job.status !== Common.JobStatus.RUNNING) {
        res.status(412).send({
            success: false,
            message: 'Job is not running.'
        });
    }
    else
        next();
}

export async function ensureStopped (req, res, next) {
    let jobId = req.params.id;
    let job = await Job.fetchJob(jobId);
    if (job.status !== Common.JobStatus.STOPPED) {
        res.status(412).send({
            success: false,
            message: 'Job is not stopped.'
        });
    }
    else
        next();
}