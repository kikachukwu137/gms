import User from '../model/user.model.js';
import AppError from '../util/AppError.js';
import sendEmail from '../util/email.js';
import crypto from 'crypto';
import { catchAsync } from '../util/catchAsync.js';
import jwt from 'jsonwebtoken';

const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statuscode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  const { _id, firstName, lastName, email, phoneNumber, agreedToTerms } = user;

  res.status(statuscode).json({
    status: 'success',
    message: 'Authentication successful',
    data: {
      token,
      user: { _id, firstName, lastName, email, phoneNumber, agreedToTerms }
    }
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    agreedToTerms: req.body.agreedToTerms,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword
  });

  user.password = undefined;

  const { _id, firstName, lastName, email, phoneNumber, agreedToTerms } = user;

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: { _id, firstName, lastName, email, phoneNumber, agreedToTerms }
    }
  });
});

export const login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password required',
      data: null
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
      data: null
    });
  }

  createSendToken(user, 200, res);
});

export const forgotPassword = async (req, res, next) => {
  try {
    if (!req.body || !req.body.email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your email',
        data: null
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address.',
        data: null
      });
    }

    const resetToken = user.createPasswordNewToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new sendEmail(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      data: null
    });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'There was an error. Please try again later.',
      data: null
    });
  }
};

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'fail',
      message: 'Token has expired or is invalid',
      data: null
    });
  }

  user.password = req.body.password;
  user.confirmedPassword = req.body.confirmedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!await user.correctPassword(req.body.currentPassword, user.password)) {
    return res.status(401).json({
      status: 'fail',
      message: 'Your current password is incorrect',
      data: null
    });
  }

  user.password = req.body.password;

  user.confirmedPassword = req.body.confirmedPassword;
  await user.save();

  createSendToken(user, 200, res);
});
