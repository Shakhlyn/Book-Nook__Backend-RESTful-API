import express from "express";

import AppError from "./utils/appError.js";
import catchAsync from "./utils/catchAsync.js";
import globalErrorHandler from "./controllers/errorController.js";
import sendResponse from "./utils/sendResponse.js";

import Book from "./models/bookModel.js";

const app = express();

// Mddleware:
// body-parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world!!!");
});

app.get(
  "/api/v1/books",
  catchAsync(async (req, res, next) => {
    const books = await Book.find();

    sendResponse(res, 200, "success", books, books.length);
  })
);

app.post(
  "/api/v1/books",
  catchAsync(async (req, res, next) => {
    const newBook = await Book.create(req.body);

    sendResponse(res, 201, "success", newBook);
  })
);

app.get(
  "/api/v1/books/:id",
  catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError("Book not found with this ID", 404));
    }

    sendResponse(res, 200, "success", book);
  })
);

app.patch(
  "/api/v1/books/:id",
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
);

app.delete(
  "/api/v1/books/:id",
  catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(new AppError("Book not found with this ID", 404));
    }
    console.log(book);
    await Book.findByIdAndDelete(req.params.id);

    sendResponse(res, 204, "success", null);
  })
);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`Could not find ${req.originalUrl} on this server`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
