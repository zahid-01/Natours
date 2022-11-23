const { catchAsync } = require('../Utils/catchAsync');
const User = require('../Models/userModels');
const AppError = require('../Utils/apperror');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError(400, 'Not an image'), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeProfilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObject = function (obj, ...args) {
  const objClone = {};
  args.forEach((el) => (objClone[el] = obj[el]));

  return objClone;
};

//UPDATE ME
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) If user posts password send an error
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(400, 'Use /updateMyPassword for changing password'));
  }

  const filteredObject = filterObject(req.body, 'name', 'email');
  if (req.file) filteredObject.photo = req.file.filename;
  //2) If user is authenticated then update user info
  const user = await User.findByIdAndUpdate(req.user.id, filteredObject, {
    runValidators: true,
    new: true,
  });

  res.status(202).json({
    status: 'Success',
    user,
  });
});

//DELETE ME
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'Use /login to create a user',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//GET ALL USERS
exports.getAllUsers = handlerFactory.readAll(User);
//Get one user
exports.getUser = handlerFactory.readOne(User);
//Update user(except passwords)
exports.updateUser = handlerFactory.updateOne(User);
//Delete user(for admin only)
exports.deleteUser = handlerFactory.deleteOne(User);
