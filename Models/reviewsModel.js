const mongoose = require('mongoose');
const Tour = require('./TourModels');

const reviewsSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is must'],
    },
    rating: {
      type: Number,
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
      required: [true, 'Ratings is requierd'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'TOURS',
      required: [true, 'Please a specify a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewsSchema.statics.calcAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      retaingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      retaingsQuantity: 0,
    });
  }
};

reviewsSchema.post('save', function (next) {
  //this points to current model
  this.constructor.calcAvgRatings(this.tour);
});

reviewsSchema.pre(/^findOneAnd/, async function (next) {
  this.data = await this.clone().findOne();
  next();
});

reviewsSchema.post(/^findOneAnd/, async function () {
  if (this.data) this.data.constructor.calcAvgRatings(this.data.tour);
});

const Review = mongoose.model('reviews', reviewsSchema);
module.exports = Review;
