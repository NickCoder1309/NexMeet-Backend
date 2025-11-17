import { Router } from "express";
import { verifyToken } from "../middlewares/auth";

import {
  registerUser,
  updateUserController,
  getUserByIdController,
  deleteUserById,
  getAllUsersController,
} from "../controller/user";

const router = Router();

// Private routes
router.get("/:userId", verifyToken, getUserByIdController);
router.put("/update/:userId", verifyToken, updateUserController);
router.delete("/delete/:userId", verifyToken, deleteUserById);

// Public routes
router.get("", getAllUsersController);
router.post("/register", registerUser);

export default router;
