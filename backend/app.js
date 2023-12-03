import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

import bookRouter from "./routes/bookRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();

// Global Mddlewares:

// set security HTTP headers
app.use(helmet());

// Limit requests from same IP
const apiLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from your IP. Please try again in an hour",
});

const loginLimiter = rateLimit({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: "Too many log-in from your IP. Please try again in an hour",
});

app.use("/api", apiLimiter);
app.use("/api/v1/users/login", loginLimiter);

// Use cookie-parser middleware
app.use(cookieParser());

// body-parser
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "category",
      "authors",
      "language",
      "translated",
      "ratingsAverage",
      "ratingsQuantity",
      "price",
      "discount",
      "publisher",
      "genre",
      "bestSeller",
      "condition",
      "role",
    ],
  })
);

// // testing middleware:
// app.use((req, res, next) => {
//   console.log(req.headers);
//   console.log(req.user);
//   next();
// });

// Router Middleware
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// Handle errors for non-defined routes
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Could not find ${req.originalUrl} on this server`, 404)
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
