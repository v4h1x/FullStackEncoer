// In the name of God
'use strict'

import { Router } from 'express';
import { query } from 'express-validator';
var router = Router();
import { ensureLoggedIn, ensureAdmin, ensureHasAuthorites } from '../middlewares/authMiddlewares.js';
import { checkValidation } from '../middlewares/commonMiddlewares.js';
import Log from '../models/log.js';

router.get('/', ensureLoggedIn, ensureAdmin,
    query('_start').optional().isInt({ allow_leading_zeroes: false }),
    query('_end').optional().isInt({ allow_leading_zeroes: false }),
    query('_sort').optional().isAlpha(),
    query('_order').optional().isAlpha(),
    query('from').optional().isInt({ allow_leading_zeroes: false }),
    query('until').optional().isInt({ allow_leading_zeroes: false }),
    checkValidation,
    async function (req, res, next) {

        try {
            let start = req.query._start;
            let end = req.query._end;
            let sortColumn = req.query._sort;
            let sortOrder = req.query._order;
            let from = req.query.from;
            let until = req.query.until;
            const options = {
                // from: new Date() - (24 * 60 * 60 * 1000),
                // until: new Date(),
                // limit: 10,
                // start: 0,
                // order: 'desc',
                fields: ['level', 'message', 'timestamp']
            };
            if (start && end) {
                options.start = start;
                options.limit = end - start + 1;
            }
            if (sortOrder) {
                options.order = sortOrder
            }
            if (from) {
                options.from = from;
            }
            if (until) {
                options.until = until;
            }
            let logs = await Log.fetchLogs(options);
            let hasNextPage = false;
            if (logs.length == end - start + 1)
                hasNextPage = true;
            res.set({
                'Access-Control-Expose-Headers': 'X-Total-Count',
                'X-Total-Count': hasNextPage ? -1 : -2
            }).send(logs);
        }
        catch (error) {
            next(error);
        }

    });

export default router;