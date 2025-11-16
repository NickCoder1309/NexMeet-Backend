import { Router } from "express";

import {
  registerUser,
  updateUserController,
  getUserByIdController,
  deleteUserById,
  getAllUsersController,
} from "../controller/user";

const router = Router();

router.get("/:userId", getUserByIdController);
router.get("", getAllUsersController);
router.post("/register", registerUser);
router.put("/update/:userId", updateUserController);
router.delete("/delete/:userId", deleteUserById);

export default router;
