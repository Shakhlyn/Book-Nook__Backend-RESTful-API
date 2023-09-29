import jwt from "jsonwebtoken";
import { promisify } from "util";

import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import sendResponse from "./../utils/sendResponse.js";

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
    httpOnly: true, //now browser won't be able to access/modify the cookie
  };

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;  //for testing, there is no way of securing
  return cookieOptions;
};

const sendToken = (res, token) => {
  //set cookieOptions:
  const cookieOptions = setCookieOptions();

  // send token
  res.cookie("jwt", token, cookieOptions);
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
  // // send the token
  sendToken(res, token);
  // before sending the response, making password and active fields 'undefined' will hide these fields to the users during signup process.
  // This won't affect the database, rather make newUser variable modified.
  newUser.password = undefined;
  newUser.active = undefined;
  //send response
  sendResponse(res, 201, "success", newUser);
});

export const logIn = catchAsync(async (req, res, next) => {
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

  //send response
  sendResponse(res, 201, "success", user);
});

// export const protect = catchAsync(async (req, res, next) => {
//   // 1. check if there is any token
//   const token = req.cookies.jwt;

//   //another option:
//   // const token = req.headers.cookie.split('=')[1]

//   if (!token) {
//     return next(new AppError("You are not logged-in", 401));
//   }

//   //2. verify the token
//   const decodedTokenObj = await promisify(jwt.verify)(
//     token,
//     process.env.JWT_SECRET
//   );

//   //3. after verification, with the id, find the user
//   const user = await User.findById(decodedTokenObj.id);

//   //4. check if user is present
//   if (!user) {
//     return next(
//       new AppError(
//         "You do not have any accout. Please create an account and come back.",
//         401
//       )
//     );
//   }

//   //if user present, check if 'password' was created before the 'token'
//   if (user.passwordChangedAfterTokenCreation(decodedTokenObj.iat)) {
//     return next(
//       new AppError("User recently changed password! Please log in again.", 401)
//     );
//   }

//   // if we send currectUse in req.user, we'll able to use it in many cases without having much troubles
//   req.user = user;

//   //go to the next operation, if everything is OK.
//   next();
// });
