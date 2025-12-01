import { Router } from "express";

import {
  saveMessageController,
  getChatbyIdController,
} from "../controller/chat";

const router = Router();

router.get("/:meetId", getChatbyIdController);
router.put("/saveMessage", saveMessageController);

export default router;
