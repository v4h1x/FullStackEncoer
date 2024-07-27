// In the name of God
'use strict'
import { Router } from 'express';
import { body } from 'express-validator';

var router = Router();
import Passport from 'passport';
import { ensureLoggedIn, ensureAdmin } from '../middlewares/authMiddlewares.js';
import { checkValidation } from '../middlewares/commonMiddlewares.js';

import User from '../models/user.js';
import io from '../socketApi.js';
import Common from '../common/common.js';

import logger from '../logger.js';

router.post('/login', Passport.authenticate('local'), async function (req, res, next) {
    let userData = { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role }
    let authorities = await User.fetchAuthorities(userData.role);
    userData.authorities = [];
    authorities.forEach(a => userData.authorities.push(a.name));
    logger.info('User ' + userData.username + ' logged in.')
    res.send(userData);
});

router.get('/logout', async function (req, res, next) {
    let userData = null;
    if (req.user)
        userData = { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role }
    const socketId = req.session.socketId;
    if (socketId && io.of("/").sockets.get(socketId)) {
        console.log(`forcefully closing socket ${socketId}`);
        io.of("/").sockets.get(socketId).disconnect(true);
    }
    req.logout(function (err) {
        if (err)
            return next(err);
        if (userData)
            logger.info('User ' + userData.username + ' logged out.')
        res.redirect('/');
    });
});

router.post('/register', ensureLoggedIn, ensureAdmin,
    body('username').notEmpty(),
    body('password').notEmpty(),
    body('email').isEmail(),
    body('role').isIn([Common.Roles.ADMIN, Common.Roles.MONITORING]),
    checkValidation,
    async function (req, res, next) {

        const user = new User(req.body);
        const userId = await User.insert(user);

        res.send({ 'id': userId });
    });

export default router;
