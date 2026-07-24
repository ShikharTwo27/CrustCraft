const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const apiRouter = require('./routes');
const { errorHandler } = require('./middleware/error');
const { AppError } = require('./utils/errors');

const app = express();

app.use(helmet());

const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.loca.lt')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use('/api', apiRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
