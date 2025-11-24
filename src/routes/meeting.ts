import { Router } from "express";
import {
  addUserMeetingController,
  createMeetingController,
  finishMeetingController,
  getAllMeetingsController,
  getAllUsersInfoinMeeting,
  getMeetingByIdController,
  getMeetingUsers,
  removeUserMeetingController,
  updateMeetingController,
} from "../controller/meeting";

const router = Router();

router.get("", getAllMeetingsController);
router.get("/:meetingId", getMeetingByIdController);
router.get("/getMeetingUsers/:meetingId", getMeetingUsers);
router.get("/getUsersMeeting/:meetingId", getAllUsersInfoinMeeting);
router.post("/start", createMeetingController);
router.put("/finish/:meetingId", finishMeetingController);
router.put("/update/:meetingId", updateMeetingController);
router.put("/addUser/:meetingId", addUserMeetingController);
router.put("/removeUser/:meetingId", removeUserMeetingController);

export default router;
