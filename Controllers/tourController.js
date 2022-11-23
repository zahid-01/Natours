const APIFeatures = require('../Utils/apifeatures');
const Tour = require('../Models/TourModels');
const { catchAsync } = require('../Utils/catchAsync');
const AppError = require('../Utils/apperror');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError(400, 'Not an image'), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //Cover image
  req.body.imageCover = `${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      req.body.images.push(`${req.params.id}-${Date.now()}-${i + 1}.jpg`);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .toFile(`public/img/tours/${req.body.images[i]}`);
    })
  );
  next();
});

//Search Tour CB
exports.searchTourCB = handlerFactory.readOne(Tour, {
  path: 'reviews',
  select: '-createdAt',
});

//PATCH
exports.patchCB = handlerFactory.updateOne(Tour);

//Delete tour CB
exports.deleteTourCB = handlerFactory.deleteOne(Tour);

//Add tour CBtours.length,
exports.addTourCB = handlerFactory.createOne(Tour);

//All tours CB
exports.allToursCB = handlerFactory.readAll(Tour);

//Top tours
exports.aliasToupTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.getTourStats = async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numberOfTours: { $sum: 1 },
        ratings: { $sum: '$retaingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        // tourName: { $push: '$name' },
      },
    },
    {
      $sort: { averageRating: -1 },
    },
  ]);

  res.status(200).json({
    stats: 'Success',
    data: { stats },
  });
};

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTours: { $sum: 1 },
        tourName: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: { numberOfTours: -1 },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: { plan },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlan, unit } = req.params;
  const [lat, lon] = latlan.split(',');
  if (!lat || !lon) return next(new AppError(400, 'Specify latiude and longitude'));
  //Radius in radians
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlan, unit } = req.params;
  const [lat, lon] = latlan.split(',');
  if (!lat || !lon) return next(new AppError(400, 'Specify latiude and longitude'));
  const distXplier = unit === 'mi' ? 0.00062137 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lon * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: distXplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
        // sort: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
