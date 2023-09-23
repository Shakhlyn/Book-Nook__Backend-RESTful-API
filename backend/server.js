import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const port = process.env.PORT;
app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log(`App is running on port ${port}...`);
});
