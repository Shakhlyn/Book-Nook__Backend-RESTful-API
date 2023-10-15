import express from "express";
import reviewRouter from "./reviewRoutes.js";

import { protect, restrictTo } from "../controllers/authController.js";
import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.use("/:bookId/reviews", reviewRouter);

router
  .route("/")
  .get(getAllBooks)
  .post(protect, restrictTo("admin"), createBook);

router
  .route("/:id")
  .get(getBook)
  .patch(protect, restrictTo("admin"), updateBook)
  .delete(protect, restrictTo("admin"), deleteBook);

export default router;
