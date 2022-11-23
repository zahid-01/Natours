const review = require('../Controllers/reviewsController');
const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });
const { protect, restrict } = require('../Controllers/authController');

reviewRouter.use(protect);
reviewRouter
  .route('/')
  .post(restrict('user'), review.setTourUserIds, review.createReview)
  .get(review.getAllReviews);

reviewRouter
  .route('/:id')
  .delete(restrict('user', 'admin'), review.deleteReview)
  .patch(restrict('user', 'admin'), review.updateReview)
  .get(review.getReview);

module.exports = reviewRouter;
