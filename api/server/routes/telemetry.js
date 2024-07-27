// In the name of God
'use strict'
import { Router } from 'express';
import { query } from 'express-validator';
var router = Router();
import { ensureLoggedIn, ensureHasAuthorites } from '../middlewares/authMiddlewares.js';
import { checkValidation } from '../middlewares/commonMiddlewares.js';

import Telemetry from '../models/telemetry.js';
import Common from '../common/common.js';

router.get('/', ensureLoggedIn,
    query('start').optional().isInt({ allow_leading_zeroes: false }).withMessage('start time must be a valid timestamp'),
    query('end').optional().isInt({ allow_leading_zeroes: false }).withMessage('end time must be a valid timestamp'),
    query('group').optional().isIn(['minute', 'hour', 'day', 'month']),
    checkValidation,
    async function (req, res, next) {

        try {
            let start = req.query.start;
            let end = req.query.end;
            let categories = Array.isArray(req.query.category) ?
                req.query.category : [req.query.category];
            let group = req.query.group;
            let telemetries = await Telemetry.fetchTelemetries(start, end, categories, group);
            res.send(telemetries);
        }
        catch (error) {
            next(error);
        }
    });

export default router;
