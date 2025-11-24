import { Router } from "express";
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

router.get("", getAllMeetingsController);
router.get("/:meetingId", getMeetingByIdController);
router.get("/getMeetingUsers/:meetingId", getMeetingUsers);
router.post("/start", createMeetingController);
router.put("/finish/:meetingId", finishMeetingController);
router.put("/update/:meetingId", updateMeetingController);
router.put("/updateOrAddMeetingUser/:meetingId", updateOrAddMeetingUser);
router.put("/removeUser/:meetingId", removeUserMeetingController);

export default router;
