import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import {
  createMeetingController,
  finishMeetingController,
  getAllMeetingsController,
  getMeetingByIdController,
  getMeetingUsers,
  removeUserMeetingController,
  updateMeetingController,
  updateOrAddMeetingUser,
} from "../controller/meeting";

const router = Router();

router.get("", verifyToken, getAllMeetingsController);
router.get("/:meetingId", verifyToken, getMeetingByIdController);
router.get("/getMeetingUsers/:meetingId", verifyToken, getMeetingUsers);
router.post("/start", verifyToken, createMeetingController);
router.put("/finish/:meetingId", verifyToken, finishMeetingController);
router.put("/update/:meetingId", verifyToken, updateMeetingController);
router.put(
  "/updateOrAddMeetingUser/:meetingId",
  verifyToken,
  updateOrAddMeetingUser,
);
router.put("/removeUser/:meetingId", verifyToken, removeUserMeetingController);

export default router;
