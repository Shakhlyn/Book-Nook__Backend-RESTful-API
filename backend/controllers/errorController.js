// import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/appError.js";

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplcateKeyError = (err) => {
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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
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
      err.isOperational = true;
      err = handleCastError(err); // handleCastError() must be assigned to a variable because the variable will be passed in the sendErrorProd() funciton
    }

    // Handle Duplicate Database Field
    if (err.code === 11000) {
      err.isOperational = true;
      err = handleDuplcateKeyError(err);
    }

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
      err.isOperational = true;
      err = handleValidationError(err);
    }

    sendErrorProduction(err, res);
  }
}
