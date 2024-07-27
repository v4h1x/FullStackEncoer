// In the name of God
'use strict'
import { Router } from 'express';
var router = Router();
import { ensureLoggedIn,  ensureAdmin} from '../middlewares/authMiddlewares.js';

import SystemInfo from '../models/system.js';

router.get('/', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getSystemInfo();
    info.caps = await SystemInfo.getServerCapabilities();
    res.send(info);
});

router.get('/software', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getSoftwareInfo();
    res.send(info);
});

router.get('/cpu', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getCpuInfo();
    res.send(info);
});

router.get('/cpu/load', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getCpuLoad();
    res.send(info);
});

router.get('/memory', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getMemoryInfo();
    res.send(info);
});

router.get('/memory/load', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getMemoryLoad();
    res.send(info);
});

router.get('/gpu', ensureLoggedIn, async function (req, res, next) {
    
    let info = await SystemInfo.getGpuInfo();
    res.send(info);
});

router.get('/network', ensureLoggedIn, async function (req, res, next) {
    
    let networkInfo = await SystemInfo.getNetworkInfo();
    res.send(networkInfo);
});

router.get('/summary', ensureLoggedIn, async function (req, res, next) {
    
    let summary = await SystemInfo.getSummary();
    res.send(summary);
});

export default router;
