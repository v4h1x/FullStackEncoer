import TelemetryDb from './models/db/telemetryDb.js'
import MainDB from './models/db/mainDb.js';

import logger from './logger.js';
import createError from 'http-errors';
import express from 'express';
// import helmet from "helmet";
import session from "express-session";
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import Bcrypt from 'bcrypt';
import io from './socketApi.js';

import passport from 'passport';
import PassportLocal from 'passport-local';
import User from './models/user.js';
import Job from './models/job.js';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import jobsRouter from './routes/jobs.js';
import loginRouter from './routes/login.js';
import systemInfoRouter from './routes/systeminfo.js';
import telemetryRouter from './routes/telemetry.js';
import logsRouter from './routes/logs.js'

await initialize();

var app = express();
const sessionMiddleware = session({ resave: false, saveUninitialized: false, secret: 'irib cyber' });

// Express Middlewares
configureMiddlewares();

// Backend api routers
configureRouters();

// Socket Middlewares
configureSocket();

// Configure passport
configurePassport();

// catch 404 and forward to error handler
configure404AndErrorHandling();

async function initialize() {
  prepareDatabase()
    .then(() => new Promise((resolve) => setTimeout(resolve, 5000)))
    .then(() => Job.initialize())
    .catch(error => console.log(error));
}

async function prepareDatabase() {
  try {
    await TelemetryDb.prepare();
    await MainDB.prepare();
  }
  catch (error) {
    console.log(error);
  }
}

function configure404AndErrorHandling() {
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    logger.error(err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // send error response
    res.status(err.status || 500).send({ success: false, message: err.message });
  });
}

function configureRouters() {
  app.use('/api', indexRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/auth', loginRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/system', systemInfoRouter);
  app.use('/api/telemetry', telemetryRouter);
  app.use('/api/logs', logsRouter);
}

function configureMiddlewares() {
  app.use(morgan('dev'));
  // app.use(helmet());
  app.use(express.json());
  app.use(sessionMiddleware);
  app.use(express.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.resolve(__dirname, '../../client/build')));
}

function configureSocket() {
  // convert a connect middleware to a Socket.IO middleware
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));
  io.use((socket, next) => {
    if (socket.request.user) {
      next();
    } else {
      console.log('unauthorized');
      next(new Error('unauthorized'));
    }
  });
}

function configurePassport() {

  passport.use(new PassportLocal.Strategy(
    async (username, password, done) => {
      const account = await User.fetchUserByUsername(username);
      if (!account)
        return done(null, false, { message: 'Incorrect username.' });
      if (!(await Bcrypt.compare(password, account.password)))
        return done(null, false, { message: 'Incorrect password.' });
      return done(null, account);
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    const account = await User.fetchUserById(id);
    done(null, account);
  });
}

export default app;