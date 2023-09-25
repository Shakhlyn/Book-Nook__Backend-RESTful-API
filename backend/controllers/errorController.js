import sendResponse from "../utils/sendResponse.js";

// GLOBAL ERROR HANDLER:
export default function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(err);
  sendResponse(res, err.statusCode, err.status, err.message);

  // if (process.env.NODE_ENV === "production") {
  // }

  // if (process.env.NODE_ENV === "development") {
  //   res.status(err.statusCode).json({
  //     status: err.status,
  //     message: err.message,
  //     stack: err.stack,
  //   });
  // }
}
