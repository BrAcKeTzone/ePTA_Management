import express from "express";
import * as attendanceController from "./attendance.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  recordAttendanceSchema,
  bulkRecordAttendanceSchema,
  updateAttendanceSchema,
  getAttendanceSchema,
  attendanceReportSchema,
  calculatePenaltiesSchema,
  attendanceStatsSchema,
} from "./attendance.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Statistics route (must be before /:id route)
router.get(
  "/stats",
  validate(attendanceStatsSchema, "query"),
  attendanceController.getAttendanceStats
);

// Parent-specific routes
router.get("/my-attendance", attendanceController.getMyAttendance);

router.get("/my-penalties", attendanceController.getMyPenalties);

// Report route (must be before /:id route)
router.get(
  "/report",
  authorize("ADMIN"),
  validate(attendanceReportSchema, "query"),
  attendanceController.generateAttendanceReport
);

// Meeting-specific attendance
router.get("/meeting/:meetingId", attendanceController.getAttendanceByMeeting);

// Record attendance for meeting
router.post(
  "/record",
  authorize("ADMIN"),
  validate(recordAttendanceSchema, "body"),
  attendanceController.recordAttendance
);

// Calculate penalties route (admin only)
router.post(
  "/calculate-penalties",
  authorize("ADMIN"),
  validate(calculatePenaltiesSchema, "body"),
  attendanceController.calculatePenalties
);

// Bulk record attendance (admin only)
router.post(
  "/bulk",
  authorize("ADMIN"),
  validate(bulkRecordAttendanceSchema, "body"),
  attendanceController.bulkRecordAttendance
);

// Get all attendance records with filters
router.get(
  "/",
  validate(getAttendanceSchema, "query"),
  attendanceController.getAttendance
);

// Record single attendance (admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(recordAttendanceSchema, "body"),
  attendanceController.recordAttendance
);

// Get attendance by ID
router.get("/:id", attendanceController.getAttendanceById);

// Update attendance (admin only)
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateAttendanceSchema, "body"),
  attendanceController.updateAttendance
);

// Delete attendance (admin only)
router.delete(
  "/:id",
  authorize("ADMIN"),
  attendanceController.deleteAttendance
);

export default router;
