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

// Rutas protegidas
router.get("/:userId", verifyToken, getUserByIdController);
router.post("/register", verifyToken, registerUser);
router.put("/update/:userId", verifyToken, updateUserController);

// Rutas públicas
router.get("", getAllUsersController);
router.delete("/delete/:userId", deleteUserById);

export default router;
