const express = require('express');
const viewRouter = express.Router();
const viewCntlr = require('../Controllers/viewController');
const { isLoggedIn } = require('../Controllers/authController');
const { protect } = require('../Controllers/authController');
const { createBookingCheckout, myBookings } = require('../Controllers/bookingController');

viewRouter.get('/me', protect, viewCntlr.me);
viewRouter.use(isLoggedIn);
viewRouter.get('/my-bookings', protect, myBookings);
viewRouter.get('/', viewCntlr.getOverview);

viewRouter.get('/tour/:slug', viewCntlr.getTour);

viewRouter.get('/log-in', viewCntlr.getLoginForm);

module.exports = viewRouter;
