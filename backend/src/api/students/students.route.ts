import express from "express";
import * as studentController from "./students.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as studentValidation from "./students.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get authenticated user's children (must be before /:id routes)
router.get("/my-children", studentController.getMyChildren);

// Create a new student
router.post(
  "/",
  validate(studentValidation.createStudent),
  studentController.createStudent
);

// Get all students with filtering and pagination (query params will be validated in controller)
router.get("/", studentController.getStudents);

// Get enrollment statistics
router.get("/stats", studentController.getEnrollmentStats);

// Get students pending approval (query params will be validated in controller)
router.get("/pending", studentController.getPendingStudents);

// Request to link a student to a parent
router.post(
  "/link",
  validate(studentValidation.requestLinkStudent),
  studentController.requestLinkStudent
);

// Get pending link requests for a parent
router.get(
  "/parent/:parentId/pending",
  studentController.getPendingLinksByParentId
);

// Get approved (linked) students for a parent
router.get(
  "/parent/:parentId/approved",
  studentController.getApprovedStudentsByParentId
);

// Get students by parent ID (all statuses)
router.get("/parent/:parentId", studentController.getStudentsByParentId);

// Get student by student ID (string format)
router.get("/student-id/:studentId", studentController.getStudentByStudentId);

// Get student by ID
router.get("/:id", studentController.getStudentById);

// Update student
router.put(
  "/:id",
  validate(studentValidation.updateStudent),
  studentController.updateStudent
);

// Delete student
router.delete("/:id", studentController.deleteStudent);

// Approve student linking
router.patch("/:id/approve", studentController.approveStudentLink);

// Reject student linking
router.patch("/:id/reject", studentController.rejectStudentLink);

// Unlink a student from parent
router.patch(
  "/:id/unlink",
  validate(studentValidation.unlinkStudent),
  studentController.unlinkStudent
);

// Bulk update student status
router.patch(
  "/bulk/status",
  validate(studentValidation.bulkUpdateStatus),
  studentController.bulkUpdateStudentStatus
);

export default router;
