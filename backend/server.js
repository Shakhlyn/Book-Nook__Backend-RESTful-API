import dotenv from "dotenv";
dotenv.config();

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
    // console.log(error.name, error.message);
    // console.log(error);
  });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log(`App is running on port ${port}...`);
});
