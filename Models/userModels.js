const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: [true, 'User name is mandatory'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please provide a valid email'],
    required: [true, 'Email is mandatory'],
    unique: [true, 'User already exists'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Enter password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      //Will only work for CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.checkPassword = async function (enteredPw, password) {
  return await bcrypt.compare(enteredPw, password);
};

userSchema.methods.passwordChangeCheck = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return passwordChangeTimeStamp > JWTTimeStamp;
  }

  return false;
};

userSchema.methods.resetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('users', userSchema);
module.exports = User;
