const Review = require('../Models/reviewsModel');
const Tour = require('../Models/TourModels');
const AppError = require('../Utils/apperror');
const { catchAsync } = require('../Utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  if (!req.body.createdAt) req.body.createdAt = Date.now();
  req.body.user = req.user.id;
  next();
};

exports.createReview = handlerFactory.createOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.getReview = handlerFactory.readOne(Review);
exports.getAllReviews = handlerFactory.readAll(Review);
