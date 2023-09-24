import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.find();

    sendResponse(res, 200, "success", docs, docs.length);
  });

export const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    sendResponse(res, 200, "success", document);
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    sendResponse(res, 201, "success", document);
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError("Document not found with this ID", 404));
    }

    sendResponse(res, 200, "success", document);
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const book = await Model.findById(req.params.id);

    // if (!book) {
    //   return next(new AppError("Book not found with this ID", 404));
    // }
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError("document not found with this ID", 404));
    }

    sendResponse(res, 204, "success", null);
  });
