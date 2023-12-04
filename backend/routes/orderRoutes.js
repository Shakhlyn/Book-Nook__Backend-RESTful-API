import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import {
  placeOrder,
  getOrderById,
  getAllOrders,
  getMyOrders,
  deleteAnOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("admin"), getAllOrders)
  .post(protect, placeOrder);

router.get("/my-order", protect, getMyOrders);
router
  .route("/:id")
  .get(protect, getOrderById)
  .delete(protect, restrictTo("admin"), deleteAnOrder);

export default router;
