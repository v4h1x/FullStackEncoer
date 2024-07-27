// In the name of God
'use strict'
import { Router } from 'express';
import { param, body, query } from 'express-validator';
import Bcrypt from 'bcrypt';
var router = Router();
import { ensureLoggedIn, ensureAdmin } from '../middlewares/authMiddlewares.js';
import { checkValidation } from '../middlewares/commonMiddlewares.js';

import logger from '../logger.js';

import Common from '../common/common.js';
import User from '../models/user.js';
import Job from '../models/job.js';

router.get('/', ensureLoggedIn, ensureAdmin,
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
        limit = req.query._end - req.query.start;
      let sortColumn = req.query._sort;
      let sortOrder = req.query._order;

      let users = await User.fetchUsers(start, limit, sortColumn, sortOrder);
      users.forEach(u => {
        delete u.password;
      });
      let total = await User.countAll();
      res.set({
        'Access-Control-Expose-Headers': 'X-Total-Count',
        'X-Total-Count': total
      }).send(users);
    }
    catch (error) {
      next(error);
    }
  });

router.get('/:id', ensureLoggedIn, ensureAdmin,
  param('id').isInt({ allow_leading_zeroes: false }),
  checkValidation,
  async function (req, res, next) {
    try {
      const id = req.params.id;
      let user = await User.fetchUserById(id);
      delete user.password;
      res.send(user);
    }
    catch (error) {
      next(error);
    }
  })

router.get('/:id/jobs', ensureLoggedIn, ensureAdmin,
  param('id').isInt({ allow_leading_zeroes: false }),
  checkValidation,
  async function (req, res, next) {
    try {
      const id = req.params.id;
      let jobs = await Job.fetchUserJobs(id);
      res.send(jobs);
    }
    catch (error) {
      next(error)
    }
  })

router.post('/', ensureLoggedIn, ensureAdmin,
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('email').isEmail(),
  body('role').isIn([Common.Roles.ADMIN, Common.Roles.MONITORING, Common.Roles.OPERATOR_L1, Common.Roles.OPERATOR_L2]),
  checkValidation,
  async function (req, res, next) {
    try {
      const payload = req.body;
      let user = new User(payload);
      let u = await User.fetchUserByUsername(user.username);
      if (u.username)
        res.status(412).send({
          success: false,
          message: 'Username already exists.'
        });
      else {
        let u = await User.fetchUserByEmail(user.email);
        if (u.email)
          res.status(412).send({
            success: false,
            message: 'Email already exists.'
          });
        else {
          let user_id = await User.insert(user);
          let new_user = await User.fetchUserById(user_id);
          delete new_user.password;
          logger.info('User ' + req.user.username + 'created a user with name ' + new_user.username);
          res.send(new_user);
        }
      }
    }
    catch (error) {
      next(error);
    }
  })

router.delete('/:id', ensureLoggedIn, ensureAdmin,
  param('id').isInt({ allow_leading_zeroes: false }),
  checkValidation,
  async function (req, res, next) {
    try {
      const id = req.params.id;
      if (id == req.user.id) {
        res.status(412).send({
          success: false,
          message: 'You can not delete yourself!'
        });
      }
      else {
        let userJobs = await Job.fetchUserJobs(id);

        for (const job of userJobs) {
          try {
            if (job.status === Common.JobStatus.RUNNING)
              await Job.stop(job.id);
            await Job.delete(job.id);
          }
          catch (error) {
            res.status(500).send({
              success: false,
              message: 'Can not stop job ' + job.name
            });
          }
        };
        await User.delete(id);
        logger.info('User ' + req.user.username + 'deleted the user with id' + user_id);
        res.send({ 'id': id });
      }
    }
    catch (error) {
      next(error);
    }
  })

router.put('/:id', ensureLoggedIn, ensureAdmin,
  param('id').isInt({ allow_leading_zeroes: false }),
  checkValidation,
  async function (req, res, next) {
    try {
      const id = req.params.id;
      const payload = req.body;
      let user = new User(payload);
      user.id = id;
      const account = await User.fetchUserById(id);
      if (!account) {
        return res.status(412).send({
          success: false,
          message: 'User does not exist.'
        });
      }
      if (user.password) {
        let oldPassword = user.oldPassword;
        if (!(await Bcrypt.compare(oldPassword, account.password))) {
          return res.status(412).send({
            success: false,
            message: 'Current password is not correct.'
          });
        }
        logger.info('User ' + req.user.username + 'changed the password of user ' + user.username);
        await User.updatePassword(user);
      }
      await User.update(user);
      let updatedUser = await User.fetchUserById(id);
      delete updatedUser.password;
      logger.info('User ' + req.user.username + 'changed the user ' + user.username);
      res.send(updatedUser);
    }
    catch (error) {
      next(error);
    }
  })

export default router;
