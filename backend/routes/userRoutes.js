import express from "express";

import {
  protect,
  restrictTo,
  signUp,
  logIn,
  logout,
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

// All the rest of the routes need to be authenticated: only logged-in user should access the APIs
router.use(protect);

router.get("/me", getMyProfile, getUser);
router.patch("/updateMyProfile", updateMyProfile);
router.patch("/deleteMyProfile", deleteMyProfile);
router.patch("/updateMyPassword", updateMyPassword);
router.post("/logout", logout);

// Rest of the APIs should be aacessed by only the 'admin'
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
