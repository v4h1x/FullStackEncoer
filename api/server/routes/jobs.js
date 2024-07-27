// In the name of God
'use strict'

import { Router } from 'express';
import { param, body, query } from 'express-validator';
import io from '../socketApi.js';
var router = Router();
import { ensureLoggedIn, ensureAdmin, ensureHasAuthorites } from '../middlewares/authMiddlewares.js';
import { ensureRunning, ensureStopped } from '../middlewares/jobMiddlewares.js';
import { checkValidation } from '../middlewares/commonMiddlewares.js';
import logger from '../logger.js';

import Common from '../common/common.js';
import Job from '../models/job.js';
import JobController from '../models/jobController.js';
import FFMpegTools from '../common/ffmpegTools/index.js';

router.get('/', ensureLoggedIn,
    query('_start').optional().isInt({ allow_leading_zeroes: false }),
    query('_end').optional().isInt({ allow_leading_zeroes: false }),
    query('_sort').optional().isAlpha(),
    query('_order').optional().isAlpha(),
    checkValidation,
    async function (req, res, next) {

        try {
            let start = req.query._start;
            let limit = null;
            if (start)
                limit = req.query._end - req.query._start;
            let sortColumn = req.query._sort;
            let sortOrder = req.query._order;
            let filters = {}
            if (req.query.name)
                filters.name = req.query.name;
            if (req.query.status)
                filters.status = req.query.status;
            if (req.query.user_id)
                filters.user_id = req.query.user_id;
            if (req.query.type)
                filters.type = req.query.type;

            let jobs = await Job.fetchJobs(start, limit, sortColumn, sortOrder, filters);
            let total = await Job.countAll(filters);
            res.set({
                'Access-Control-Expose-Headers': 'X-Total-Count',
                'X-Total-Count': total
            })
            res.send(jobs);
        }
        catch (error) {
            next(error);
        }
    });

router.get('/:id', ensureLoggedIn,
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    async function (req, res, next) {

        try {
            let jobId = req.params.id;
            let job = await Job.fetchJob(jobId);
            res.send(job);
        }
        catch (error) {
            next(error);
        }
    });

router.get('/:id/logs', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.VIEW_JOB_LOG),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    async function (req, res, next) {

        try {
            let jobId = req.params.id;
            let job = await Job.fetchJob(jobId);

            let stream = await Job.getLogStream(job);
            stream.on('error', error => console.log(error));
            stream.pipe(res);
        }
        catch (error) {
            next(error);
        }
    });

router.post('/:id/attach', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.VIEW_JOB_LOG),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    ensureRunning, async function (req, res, next) {

        try {
            let jobId = req.params.id;
            let job = await Job.fetchJob(jobId);
            let stream = await Job.attach(job);

            res.on('close', async () => {
                await JobController.detach(job)
            })
            res.on('end', async () => {
                await JobController.detach(job)
            })
            res.on('finish', async () => {
                await JobController.detach(job)
            })
            res.on('unpipe', async () => {
                await JobController.detach(job)
            })
            stream.pipe(res);
            // const socketId = req.session.socketId;
            // 
            // if (socketId && io.of("/").sockets.get(socketId)) {
            //     io.of("/").sockets.get(socketId).on(Common.Events.JOB_LOG_END, async () => await JobController.detach(job))
            // }
            // stream.on('data', function (chunk) {
            //     if (socketId && io.of("/").sockets.get(socketId)) {
            //         console.log(chunk.toString('utf8'));
            //         io.of("/").sockets.get(socketId).emit(Common.Events.JOB_LOG, chunk.toString('utf8'));
            //     }
            // });
        }
        catch (error) {
            next(error);
        }
    });

router.post('/:id/detach', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.VIEW_JOB_LOG),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    ensureRunning, async function (req, res, next) {

        try {
            let jobId = req.params.id;
            let job = await Job.fetchJob(jobId);
            await Job.detach(job);
            res.send({});
        }
        catch (error) {
            next(error);
        }
    });

router.post('/',
    ensureLoggedIn, ensureHasAuthorites(Common.Authorities.CREATE_JOBS),
    body('name').notEmpty(),
    body('command').notEmpty(),
    checkValidation,
    async function (req, res, next) {
        try {
            const payload = req.body;
            let job = new Job(payload);

            let exists = await Job.fetchJobByName(job.name);
            if (exists)
                res.status(412).send({
                    success: false,
                    message: 'Job name already exists.'
                });
            else {
                job.user_id = req.user.id;
                job.status = Common.JobStatus.STOPPED;

                job.type = Common.JobType.CPU;
                try {
                    let command = FFMpegTools.parseCommand(job.command);
                    console.log(command);
                    if (command.outputs) {
                        for (const output of command.outputs)
                            for (const key in output.options) {
                                if (typeof output.options[key] !== 'string' && !(output.options[key] instanceof String))
                                    continue;
                                if (output.options[key].indexOf('nv') > -1) {
                                    job.type = Common.JobType.GPU;
                                    break;
                                }
                            }
                    }
                    let job_id = await Job.insert(job);
                    let new_job = await Job.fetchJob(job_id);
                    logger.info('User ' + req.user.username + ' created job ' + new_job.name);
                    res.send(new_job);
                }
                catch (error) {
                    console.log(error)
                    res.status(304).send({
                        success: false,
                        message: 'job command is not valid!\n' + error
                    })
                }
            }
        }
        catch (error) {
            next(error);
        }
    })

router.delete('/:id', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.CREATE_JOBS),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    ensureStopped, async function (req, res, next) {
        try {
            const id = req.params.id;
            await Job.delete(id);
            logger.info('User ' + req.user.username + ' deleted job with id ' + id);
            res.send({ 'id': id });
        }
        catch (error) {
            next(error);
        }
    })

router.put('/:id', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.CREATE_JOBS),
    param('id').isInt({ allow_leading_zeroes: false }),
    body('name').notEmpty(),
    body('command').notEmpty(),
    checkValidation,
    ensureStopped, async function (req, res, next) {
        try {
            const payload = req.body;
            let job = new Job(payload);
            job.id = req.params.id;
            job.user_id = req.user.id;
            await Job.update(job);
            logger.info('User ' + req.user.username + ' changed job ' + job.name);
            res.send(job);
        }
        catch (error) {
            next(error);
        }
    })

router.post('/:id/start', ensureLoggedIn, ensureHasAuthorites(Common.Authorities.CONTROL_JOBS),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    async function (req, res, next) {
        try {
            const jobId = req.params.id;
            let job = await Job.fetchJob(jobId);
            if (job.status === Common.JobStatus.RUNNING) {
                res.status(304).send({
                    success: false,
                    message: 'job is running!'
                })
            }
            else {
                job.user_id = req.user.id;
                Job.start(job,
                    () => {
                        logger.info('User ' + req.user.username + ' started job ' + job.name);
                        res.send({ 'status': job.status });
                        io.emit(Common.Events.JOB_STATUS_CHANGED, job.id, job.status);

                    },
                    (error) => {
                        next(error);
                    });
            }
        }
        catch (error) {
            next(error);
        }
    })

router.post('/:id/stop', ensureLoggedIn, ensureLoggedIn, ensureHasAuthorites(Common.Authorities.CONTROL_JOBS),
    param('id').isInt({ allow_leading_zeroes: false }),
    checkValidation,
    async function (req, res, next) {
        try {
            const jobId = req.params.id;
            let job = await Job.fetchJob(jobId);
            if (job.status === Common.JobStatus.STOPPED) {
                res.status(304).send({
                    success: false,
                    message: 'job is stopped!'
                })
            }
            else {
                job.user_id = req.user.id;
                await Job.stop(job);
                logger.info('User ' + req.user.username + ' stopped job ' + job.name);
                res.send({ 'status': job.status });
                io.emit(Common.Events.JOB_STATUS_CHANGED, job.id, job.status);

            }
        }
        catch (error) {
            next(error);
        }
    })

export default router;
