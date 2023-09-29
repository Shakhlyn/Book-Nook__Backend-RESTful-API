import express from "express";

// import * as authController from "../controllers/authController.js";

import { signUp, logIn, protect } from "./../controllers/authController.js";

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

router.route("/").get(protect, getAllUsers).post(createUser);

router.use(protect);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
