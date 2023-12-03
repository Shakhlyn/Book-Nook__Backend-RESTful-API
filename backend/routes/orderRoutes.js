import express from "express";

import { protect } from "../controllers/authController.js";
import { placeOrder, getOrderById } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, placeOrder);

router.get("/:id", protect, getOrderById);

export default router;
