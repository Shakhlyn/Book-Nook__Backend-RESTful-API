import jwt from "jsonwebtoken";

import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/apiFeatures.js";
// import sendResponse from "../utils/sendResponse.js";

import User from "../models/userModel.js";

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
    httpOnly: true, //now browser won't be able to access/modify the cookie
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  return cookieOptions;
};

const sendToken = (res, token) => {
  //set cookieOptions:
  const cookieOptions = setCookieOptions();

  // send token
  res.cookie("jwt", token, cookieOptions);
};

const sendResponseWithToken = (res, statusCode, token, user) => {
  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Create User: save the data of body
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  // sign a Token
  const token = signToken(newUser._id);
  // signToken(newUser._id);

  // // send the token
  sendToken(res, token);
  // res.cookie("jwt", token, cookieOptions);

  // console.log(req.cookies.jwt);
  // console.log(req.headers.cookie.split("=")[1]);   //These values are not same as token, which is sent to user???

  // before sending the response, making password and active fields 'undefined' will hide these fields to the users during signup process.
  newUser.password = undefined;
  newUser.active = undefined;

  //send response
  //   sendResponse(res, 201, "success", newUser);
  sendResponseWithToken(res, 201, token, newUser);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if fields are not blank
  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }

  //find the user associated with the email and add password with the user.
  // here we have to use 'findOne', otherwise it will find an array of users, which is not desirable
  const user = await User.findOne({ email: email }).select("+password");

  //check if there is a user with the email and the password is matched with the database's password
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError("Email or Password is not correct", 401));
  }

  // sign and send token, if everything is fine
  const token = signToken(user._id);

  sendToken(res, token);

  user.password = undefined;
  user.active = undefined;

  sendResponseWithToken(res, 201, token, user);
});
