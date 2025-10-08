import express from "express";
import * as meetingsController from "./meetings.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  createMeetingSchema,
  updateMeetingSchema,
  addMinutesSchema,
  addResolutionsSchema,
  updateQuorumSchema,
  getMeetingsSchema,
  sendNotificationsSchema,
} from "./meetings.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/meetings/stats
 * @desc    Get meeting statistics
 * @access  Private (Admin only)
 */
router.get("/stats", authorize("ADMIN"), meetingsController.getMeetingStats);

/**
 * @route   GET /api/meetings/history
 * @desc    Get meeting history (past meetings)
 * @access  Private
 */
router.get("/history", meetingsController.getMeetingHistory);

/**
 * @route   GET /api/meetings/upcoming
 * @desc    Get upcoming meetings
 * @access  Private
 */
router.get("/upcoming", meetingsController.getUpcomingMeetings);

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings with filtering
 * @access  Private
 */
router.get(
  "/",
  validate(getMeetingsSchema, "query"),
  meetingsController.getMeetings
);

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authorize("ADMIN"),
  validate(createMeetingSchema),
  meetingsController.createMeeting
);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private
 */
router.get("/:id", meetingsController.getMeetingById);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateMeetingSchema),
  meetingsController.updateMeeting
);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting
 * @access  Private (Admin only)
 */
router.delete("/:id", authorize("ADMIN"), meetingsController.deleteMeeting);

/**
 * @route   POST /api/meetings/:id/minutes
 * @desc    Add minutes to a meeting
 * @access  Private (Admin only)
 */
router.post(
  "/:id/minutes",
  authorize("ADMIN"),
  validate(addMinutesSchema),
  meetingsController.addMinutes
);

/**
 * @route   POST /api/meetings/:id/resolutions
 * @desc    Add resolutions to a meeting
 * @access  Private (Admin only)
 */
router.post(
  "/:id/resolutions",
  authorize("ADMIN"),
  validate(addResolutionsSchema),
  meetingsController.addResolutions
);

/**
 * @route   PUT /api/meetings/:id/quorum
 * @desc    Update quorum for a meeting
 * @access  Private (Admin only)
 */
router.put(
  "/:id/quorum",
  authorize("ADMIN"),
  validate(updateQuorumSchema),
  meetingsController.updateQuorum
);

/**
 * @route   POST /api/meetings/:id/notify
 * @desc    Send meeting notifications
 * @access  Private (Admin only)
 */
router.post(
  "/:id/notify",
  authorize("ADMIN"),
  validate(sendNotificationsSchema),
  meetingsController.sendNotifications
);

/**
 * @route   POST /api/meetings/:id/cancel
 * @desc    Cancel a meeting
 * @access  Private (Admin only)
 */
router.post(
  "/:id/cancel",
  authorize("ADMIN"),
  meetingsController.cancelMeeting
);

export default router;
