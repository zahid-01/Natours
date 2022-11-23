const express = require('express');

const tourController = require('../Controllers/tourController');
const { restrict, protect } = require('../Controllers/authController');
const reviewRouter = require('./reviewRouter');

/* creates a router as a module, loads a middleware function in it,
 defines some routes, and mounts the router module on a path in the main app*/
const tourRouter = express.Router();

tourRouter.route('/top-5-cheap').get(tourController.aliasToupTours, tourController.allToursCB);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
  .route('/plan/:year')
  .get(protect, restrict('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(tourController.allToursCB)
  .post(protect, restrict('admin', 'lead-guide'), tourController.addTourCB);

tourRouter
  .route('/:id')
  .patch(
    protect,
    tourController.uploadTourPhoto,
    tourController.resizeTourImages,
    restrict('admin', 'lead-guide'),
    tourController.patchCB
  )
  .get(tourController.searchTourCB)
  .delete(protect, restrict('admin', 'lead-guide'), tourController.deleteTourCB);

tourRouter
  .route('/tours-within/:distance/center/:latlan/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter.route('/distance/:latlan/unit/:unit').get(tourController.getDistances);
// tourRouter.route('/:tourId/reviews').post(protect, restrict('user'), createReview);
tourRouter.use('/:tourId/reviews', reviewRouter);
module.exports = tourRouter;
