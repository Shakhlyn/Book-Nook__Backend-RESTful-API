// import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/appError.js";

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplcateKeyError = (err, next) => {
  //to send the 'duplicate field', we have to extract it from property 'errmsg'
  const value = err.errmsg.match(/"([^"]*)"/g);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  // const errors = Object.values(err.errors).map((el) => el.message);
  // const message = `Invalid input data: ${errors.join(". ")}`;
  // return new AppError(message, 400);
  return new AppError(err.message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again", 401);
};

const handleTokenExpiredError = () => {
  return new AppError("Token is expired! Please log in again", 401);
};

const sendErrorDev = (err, res) => {
  // console.log(err);
  console.log(err.isOperational);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // console.log(err.isOperational);
  if (err.isOperational) {
    // console.log(`from if : ${err.isOperational}`);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.log(`from else: ${err.isOperational}`);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// GLOBAL ERROR HANDLER:
export default function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // Handle invalid Database ID:
    if (err.name === "CastError") {
      err = handleCastError(err); // handleCastError() must be assigned to a variable because the variable will be passed in the sendErrorProd() funciton
    }

    // Handle Duplicate Database Field
    if (err.code === 11000) {
      err = handleDuplcateKeyError(err, next);
    }

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
      err = handleValidationError(err);
    }

    if (err.name === "JsonWebTokenError") err = handleJWTError();

    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();

    sendErrorProduction(err, res);
  }
}
