import bcrypt from "bcrypt";

import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendResponse from "../utils/sendResponse.js";

import User from "../models/userModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlerFactory.js";

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const createUser = createOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const getMyProfile = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

export const updateMyProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError("Password can't be updated through this route!", 400)
    );
  }

  if (req.body.role) {
    return next(
      new AppError("Only Admin can assign or change user role!", 400)
    );
  }

  const filteredBody = filterObj(req.body, "username", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, "success", updatedUser);
});

export const deleteMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (
    !req.body.password ||
    !(await user.isCorrectPassword(req.body.password, user.password))
  ) {
    return next(new AppError("Password is not correct", 401));
  }

  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  sendResponse(res, 204, "Successfully deleted", null);
});
