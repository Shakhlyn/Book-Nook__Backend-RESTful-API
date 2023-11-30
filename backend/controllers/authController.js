import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";

import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import sendResponse from "./../utils/sendResponse.js";
import sendEmail from "../utils/email.js";

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

  // send token or other word set the cookie
  res.cookie("jwt", token, cookieOptions);
};

export const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Create User: save the data of body: we shouldn't save all the data.Should save only that are required
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
  //Since we have sent the token through cookies, which is the best practice, there is no meaning of sending token though response again.
  sendResponse(res, 201, "success", newUser);
});

export const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if fields are not blank
  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }

  //find the user associated with the email and add password field with the user.
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

export const logout = (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1. check if there is any token
  const token = req.cookies.jwt;

  //another option:
  // const token = req.headers.cookie.split('=')[1]

  if (!token) {
    return next(new AppError("You are not logged-in", 401));
  }

  //2. verify the token
  const decodedTokenObj = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3. after verification, with the id, find the user
  // const user = await User.findById(decodedTokenObj.id).select("-password"); //this will prevent password being disclosed.
  const user = await User.findById(decodedTokenObj.id);

  //4. check if user is present
  if (!user) {
    return next(
      new AppError(
        "You do not have any accout. Please create an account and come back.",
        401
      )
    );
  }

  //if user present, check if 'password' was created before the 'token'
  if (user.passwordChangedAfterTokenCreation(decodedTokenObj.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // if we send currectUse in req.user, we'll able to use it in many cases without having much troubles
  req.user = user;

  //go to the next operation, if everything is OK.
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action")
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user found corresponding this e-mail", 401));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (valid only for 10 minutes)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again later.",
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  //find user with the "resetToken"
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired!", 400));
  }

  //2: if user, save the body and send response
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3. update passwordChangedAt property: because of pre hook of document middleware, it will be updated

  //4. log the user in:

  user.password = undefined;
  user.passwordConfirm = undefined;

  const token = signToken(user._id);

  sendToken(res, token);

  sendResponse(res, 201, "success", user);
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  //1)get the user
  const user = await User.findById(req.user._id).select("+password");

  //2) check if the POSTed password is correct:

  if (
    !(await user.isCorrectPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  // 3) if so, update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) log in with new password:
  user.password = undefined;
  user.passwordConfirm = undefined;

  const token = signToken(user._id);

  sendToken(res, token);

  sendResponse(res, 201, "success", user);
});
