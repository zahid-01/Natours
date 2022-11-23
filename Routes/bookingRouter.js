const express = require('express');
const bookingRouter = express.Router();
const bookingCntlr = require('../Controllers/bookingController');
const { protect, restrict } = require('../Controllers/authController');

bookingRouter.use(protect);
bookingRouter.route('/get-checkout/:tourId').get(bookingCntlr.getCheckOutSession);

bookingRouter.use(restrict('lead-guide', 'admin'));

bookingRouter.route('/all-bookings').get(bookingCntlr.getAllBookings);

bookingRouter
  .route('/:id')
  .get(bookingCntlr.getOneBooking)
  .patch(bookingCntlr.updateBooking)
  .delete(bookingCntlr.deleteBooking);

module.exports = bookingRouter;
