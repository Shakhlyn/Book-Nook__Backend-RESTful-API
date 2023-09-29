//  // // WORKING.....
import jwt from "jsonwebtoken";
import { promisify } from "util";

import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";

import User from "./../models/userModel.js";

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const setCookieOptions = () => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
  };

  return cookieOptions;
};

const sendToken = (res, token) => {
  const cookieOptions = setCookieOptions();

  res.cookie("jwt", token, cookieOptions);
};

const sendResponse = (res, statusCode, status, data, ...results) => {
  res.status(statusCode).json({
    status: status,
    results: results[0],
    data: {
      data: data,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {});

export const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError("Email or Password is not correct", 401));
  }

  const token = signToken(user._id);

  sendToken(res, token);

  user.password = undefined;
  user.active = undefined;

  sendResponse(res, 201, "success", user);
});
