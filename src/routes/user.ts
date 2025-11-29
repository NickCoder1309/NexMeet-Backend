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

router.get("/:userId", verifyToken, getUserByIdController);
router.put("/update/:userId", verifyToken, updateUserController);
router.delete("/delete/:userId", verifyToken, deleteUserById);
router.post("/register", verifyToken, registerUser);
router.get("", verifyToken, getAllUsersController);

export default router;
