const Tour = require('../Models/TourModels');
const { catchAsync } = require('../Utils/catchAsync');
const AppError = require('../Utils/apperror');
const User = require('../Models/userModels');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user photo',
  });

  if (!tour) return next(new AppError(404, 'No tour with that name'));
  res.status(200).render('tour', {
    title: tour.name,
    tour,
    reload: true,
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.me = (req, res) => {
  res.status(200).render('me', {
    title: 'Me',
  });
};

// exports.updateUser = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res.status(200).render('me', {
//     title: 'Me',
//     user: user,
//   });
// });
