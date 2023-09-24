import express from "express";

import Book from "./models/bookModel.js";

const app = express();

// Mddleware:
// body-parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world!!!");
});

const sendResponse = (res, statusCode, statusMessage, data, ...results) => {
  res.status(statusCode).json({
    status: statusMessage,
    results: results[0],
    data: {
      data: data,
    },
  });
};

app.get("/api/v1/books", async (req, res) => {
  try {
    const books = await Book.find();

    sendResponse(res, 200, "success", books, books.length);
  } catch (err) {
    sendResponse(res, 404, "fail", err);
  }
});

app.post("/api/v1/books", async (req, res) => {
  try {
    const newBook = await Book.create(req.body);

    sendResponse(res, 201, "success", newBook);
  } catch (err) {
    sendResponse(res, 400, "failed", err);
  }
});

app.get("/api/v1/books/:id", async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      const err = new Error(`Not found`);
      err.statusCode = 404;
      err.status = "fail";
      next(err);
    }

    sendResponse(res, 200, "success", book);
  } catch (err) {
    sendResponse(res, 400, "failed", err);
  }
});

app.patch("/api/v1/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      const err = new Error(`Not found`);
      err.statusCode = 404;
      err.status = "fail";
      next(err);
    }

    sendResponse(res, 200, "success", book);
  } catch (err) {
    sendResponse(res, 500, "failed", err);
  }
});

app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    sendResponse(res, 204, null);
  } catch (err) {
    sendResponse(res, 500, "failed", err);
  }
});

app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

// GLOBAL ERROR HANDLER:
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  sendResponse(res, err.statusCode, err.status, err.message);
});

export default app;
