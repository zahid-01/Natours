const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'TOURS',
    required: [true, 'Tour must be specified'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'User must be specified'],
  },
  price: {
    type: Number,
    required: [true, 'Price must be specified'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Bookings = mongoose.model('bookings', bookingSchema);
module.exports = Bookings;
