import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";

import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;
