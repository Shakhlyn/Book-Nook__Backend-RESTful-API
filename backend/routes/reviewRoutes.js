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

// All the 'reviewRoutes' should be authenticated
router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), insertUserIdBookId, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user"), updateReview)
  .delete(restrictTo("user"), deleteReview);

export default router;
