const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../Utils/apperror');
const User = require('../Models/userModels');
const { catchAsync } = require('../Utils/catchAsync');
const Email = require('../Utils/sendemail');

const cookieOptions = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  httpOnly: true,
};
if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const genToken = function (id) {
  return jwt.sign(id, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = genToken({ id: user._id });

  res.cookie('jwt', token, cookieOptions);

  //Hide the password from the response
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    user: user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  createSendToken(user, 200, res);
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //0) Check if email and password entered
  if (!email || !password) {
    return next(new AppError(500, 'Enter password and email'));
  }
  //1) Check if the user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  const check = await user?.checkPassword(password, user.password);
  if (!user || !check) {
    return next(new AppError(404, 'Invalid credentials'));
  }
  //3)Send the response
  createSendToken(user, 200, res);
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'You are logged out', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'Success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and checking if its there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError(401, 'You are not logged in'));
  }
  //2) Verification token
  // const verify = jwt.verify(token, process.env.JWT_SECRET);
  //To skip a callback and still make this line asynchronous do this:
  const verify = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if user still exists
  const activeUser = await User.findById(verify.id);
  if (!activeUser) return next(new AppError(500, 'User does not exist'));

  //4) Check if user has changed password
  if (activeUser.passwordChangeCheck(verify.iat)) {
    return next(new AppError(500, 'Password chhanged, login again  '));
  }

  //Allow the user to access the tour routes
  req.user = activeUser;
  res.locals.user = activeUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const verify = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      const activeUser = await User.findById(verify.id);
      if (!activeUser) return next();

      if (activeUser.passwordChangeCheck(verify.iat)) {
        return next();
      }
      res.locals.user = activeUser;
      return next();
    }
  } catch (e) {
    return next();
  }
  next();
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Not authorized'));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  //1) verify the user exists and logged in
  const user = await User.findOne({ email });
  if (!user) next(new AppError(403, 'No user exists with this email'));
  const resetToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //2) Send the reset token
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  try {
    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to your email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError(500, 'Sending email failed'));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError(403, 'Invalid token'));

  //2)If token has not expired and user exists, generate new password.
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError(400, 'Enter Password and Confirm Passsword'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get user from the collection
  let token;

  const user = await User.findById(req.user.id).select('+password');

  //2)Verify the old password
  const passwordOld = req.body.password;
  const newPassword = req.body.updatePassword;
  if (!passwordOld || !newPassword) return next(new AppError(400, 'Provide old password'));

  // console.log(await user.checkPassword(passwordOld, user.password));
  if (!(await user.checkPassword(passwordOld, user.password)))
    return next(new AppError(400, 'Wrong password'));

  user.password = newPassword;
  user.passwordConfirm = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
