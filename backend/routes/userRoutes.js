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
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);

router.get("/me", protect, getMyProfile, getUser);
router.patch("/updateMyProfile", protect, updateMyProfile);
router.patch("/deleteMyProfile", protect, deleteMyProfile);

router.patch("/updateMyPassword", protect, updateMyPassword);

router.route("/").get(protect, getAllUsers).post(createUser);

router.use(protect);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
