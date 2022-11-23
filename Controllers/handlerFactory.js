const AppError = require('../Utils/apperror');
const { catchAsync } = require('../Utils/catchAsync');
const APIFeatures = require('../Utils/apifeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete({ _id: req.params.id });
    if (!document) {
      return next(new AppError(404, 'No record found'));
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(404, 'No record found'));
    }
    res.status(200).json({ message: 'Success', data: { doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.readOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.find({ _id: id });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(404, 'No record found'));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.readAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'Success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
