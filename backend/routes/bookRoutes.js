import express from "express";

import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";

import Book from "../models/bookModel.js";

const router = express.Router();

router
  .route("/")
  .get(
    catchAsync(async (req, res, next) => {
      const books = await Book.find();

      sendResponse(res, 200, "success", books, books.length);
    })
  )
  .post(
    catchAsync(async (req, res, next) => {
      const newBook = await Book.create(req.body);

      sendResponse(res, 201, "success", newBook);
    })
  );

router
  .route("/:id")
  .get(
    catchAsync(async (req, res, next) => {
      const book = await Book.findById(req.params.id);

      if (!book) {
        return next(new AppError("Book not found with this ID", 404));
      }

      sendResponse(res, 200, "success", book);
    })
  )
  .patch(
    catchAsync(async (req, res, next) => {
      const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!book) {
        return next(new AppError("Book not found with this ID", 404));
      }

      sendResponse(res, 200, "success", book);
    })
  )
  .delete(
    catchAsync(async (req, res, next) => {
      const book = await Book.findById(req.params.id);

      if (!book) {
        return next(new AppError("Book not found with this ID", 404));
      }
      await Book.findByIdAndDelete(req.params.id);

      sendResponse(res, 204, "success", null);
    })
  );

export default router;
