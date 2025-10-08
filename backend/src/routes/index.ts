import express from "express";
const router = express.Router();

import authRouter from "../api/auth/auth.route";
import userRouter from "../api/users/users.route";
import studentRouter from "../api/students/students.route";
import meetingRouter from "../api/meetings/meetings.route";
import attendanceRouter from "../api/attendance/attendance.route";
import penaltyRouter from "../api/penalties/penalties.route";
import projectRouter from "../api/projects/projects.route";
import contributionRouter from "../api/contributions/contributions.route";
import announcementRouter from "../api/announcements/announcements.route";
import settingsRouter from "../api/settings/settings.route";

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/students", studentRouter);
router.use("/meetings", meetingRouter);
router.use("/attendance", attendanceRouter);
router.use("/penalties", penaltyRouter);
router.use("/projects", projectRouter);
router.use("/contributions", contributionRouter);
router.use("/announcements", announcementRouter);
router.use("/settings", settingsRouter);

export default router;
