//Takes care of path factoring
const path = require('path');

//Express is abstraction of node.Js
const express = require('express');

//Prints URL's in the console
const morgan = require('morgan');

//Mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');

const compression = require('compression');

//XSS sanitze
const xss = require('xss-clean');

//Cookie parser
const cookieParser = require('cookie-parser');

//Rate Limiter
const rateLimit = require('express-rate-limit');

//Our user Routers
const userRouter = require('./Routes/userRoutes');

//Parameter pollution prevention
const hpp = require('hpp');

//Our tour routers
const tourRouter = require('./Routes/tourRoutes');

//Reviews router
const reviewRouter = require('./Routes/reviewRouter');

//View router
const viewRouter = require('./Routes/viewRouter');

//Booking router
const bookingRouter = require('./Routes/bookingRouter');

//Create an express application or we can say instance of express.
//This is basically the start of our whole project
const app = express();
app.enable('trust proxy');

//Our Global error class
const AppError = require('./Utils/apperror');

//Callback of our errror class
const errorController = require('./Controllers/errorController');

// const helmet = require('helmet');

//Set httpHeaders
// app.use(helmet());

//Middleware for POST JSON data
//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Mongo sanitize
app.use(mongoSanitize());

//XSS sanitization
app.use(xss());

//hpp
app.use(hpp());

//Custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Limit number of requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP, try back in one hour',
});

app.use('/api', limiter);

//Enable morgan consoles only for dev phase only
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Setting up for templates engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Middleware for User routers
//app.use('route', Callback function)
app.use('/api/v1/users', userRouter);

//Middleware for Tour routers
//app.use('route', Callback function)
app.use('/api/v1/tours', tourRouter);

//Middelware for review router
app.use('/api/v1/review', reviewRouter);

//Middleware from booking router
app.use('/api/v1/booking', bookingRouter);

app.use(compression());

//Middleware for rendering
app.use('/', viewRouter);

//Global error handling middleware, for invalid URLS
app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server.`));
});

//Global error handling middleware
app.use(errorController);

//Export whole of this express application to be listned
module.exports = app;
