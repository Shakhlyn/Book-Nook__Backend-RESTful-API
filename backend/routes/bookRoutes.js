import express from "express";
import reviewRouter from "./reviewRoutes.js";

import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.use("/:bookId/reviews", reviewRouter);

router.route("/").get(getAllBooks).post(createBook);

router.route("/:id").get(getBook).patch(updateBook).delete(deleteBook);

export default router;
