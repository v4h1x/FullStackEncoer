// In the name of God

import Common from '../common/common.js';
import User from '../models/user.js';

export function ensureLoggedIn(req, res, next) {
    // isAuthenticated is set by `deserializeUser()`
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send({
            success: false,
            message: 'You are not authenticated to access this resource!'
        })
    } else
        next();
}

export function ensureAdmin(req, res, next) {
    // isAuthenticated is set by `deserializeUser()`
    if (!req.user || (req.user.role !== Common.Roles.ADMIN)) {
        res.status(401).send({
            success: false,
            message: 'You are not authorized to access this resource!'
        })
    } else
        next();
}

export function ensureHasRole(role) {
    return (req, res, next) => {
        // isAuthenticated is set by `deserializeUser()`
        if (!req.user || (req.user.role !== role)) {
            res.status(401).send({
                success: false,
                message: 'You are not authorized to access this resource!'
            })
        } else
            next();
    }
}

export function ensureHasAuthorites(...authorities) {
    return async (req, res, next) => {
        // isAuthenticated is set by `deserializeUser()`
        if (!req.user || !req.user.role) {
            res.status(401).send({
                success: false,
                message: 'You are not authorized to access this resource!'
            })
        } else {
            let uAuthorites = await User.fetchAuthorities(req.user.role);
            if (authorities.every(a => {
                for (let u of uAuthorites)
                    if (a === u.name)
                        return true;
                return false;
            }))
                next();
            else
                res.status(401).send({
                    success: false,
                    message: 'You are not authorized to access this resource!'
                })
        }
    }
}
