import express from "express";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import bookRouter from "./routes/bookRoutes.js";

const app = express();

// Mddleware:
// body-parser
app.use(express.json());

app.use("/api/v1/books", bookRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`Could not find ${req.originalUrl} on this server`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
