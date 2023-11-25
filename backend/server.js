import dotenv from "dotenv";
dotenv.config({ path: "dotenv.env" });

import mongoose from "mongoose";

import app from "./app.js";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Mongoose connection is on!!!");
  })
  .catch((error) => {
    console.log("There is an error in Mongoose Connection");
  });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log(`App is running on port ${port}...`);
});

// For Async 'Uhandled promise rejection' case: error that not catched with catch() block

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection! Shutting down...");
  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }
  if (process.env.NODE_ENV === "production") {
    console.log(`${err.name}: ${err.message}`);
  }

  server.close(() => {
    process.exit(1);
  });
});

// Then for Synchronous errors, we have to define 'uncaughtException' at the top before any code execution.
// Othewise, errors for the code, which executed after error handler, won't be handled.
