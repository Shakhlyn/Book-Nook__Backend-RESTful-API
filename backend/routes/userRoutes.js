import express from "express";

// import * as authController from "../controllers/authController.js";

import {
  signUp,
  logIn,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} from "./../controllers/authController.js";

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);

router.patch("/updateMyPassword", protect, updateMyPassword);

router
  .route("/")
  .get(protect, restrictTo("admin"), getAllUsers)
  .post(createUser);

router.use(protect, restrictTo("admin"));
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
