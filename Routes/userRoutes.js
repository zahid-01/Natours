const express = require('express');
const userController = require('../Controllers/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrict,
  logout,
} = require('../Controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.route('/forgot-password').post(forgotPassword);
userRouter.route('/reset-password/:token').patch(resetPassword);

userRouter.use(protect);
userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.route('/updateMyPassword').patch(updatePassword);
userRouter.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeProfilePhoto,
  userController.updateMe
);
userRouter.delete('/deleteMe', userController.deleteMe);

userRouter.use(restrict('admin'));
userRouter.route('/').get(userController.getAllUsers).post(userController.createNewUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
