import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  insertUserIdBookId,
} from "../controllers/reviewController.js";

// const router = express.Router();
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), insertUserIdBookId, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;
