import { Router } from "express";

import {
  saveMessageController,
  getChatbyIdController,
  getChatsByUserController,
} from "../controller/chat";

const router = Router();

router.get("/:meetId", getChatbyIdController);
router.put("/saveMessage", saveMessageController);
router.get("/chatsByUser/:userId", getChatsByUserController);

export default router;
