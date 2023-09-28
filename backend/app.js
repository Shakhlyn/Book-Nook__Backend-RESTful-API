import express from "express";
import cookieParser from "cookie-parser";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import bookRouter from "./routes/bookRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

const app = express();

// Mddleware:
// Use cookie-parser middleware
app.use(cookieParser());

// body-parser
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.headers);
  next();
});

// Router Middleware
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

// Handle errors for non-defined routes
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Could not find ${req.originalUrl} on this server`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
