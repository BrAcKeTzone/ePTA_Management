import express from "express";
import * as announcementController from "./announcements.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as announcementValidation from "./announcements.validation";

const router = express.Router();

// Public routes (no auth required)
router.get("/active", announcementController.getActiveAnnouncements);

// Protected routes (auth required)
router.use(authenticate);

// Get unread count (must be before /:id route)
router.get("/unread-count", announcementController.getUnreadCount);

// Get my read status (must be before /:id route)
router.get("/my-read-status", announcementController.getMyReadStatus);

// Mark announcement as read
router.post("/:id/read", announcementController.markAnnouncementAsRead);

// Announcement CRUD operations
router.post(
  "/",
  validate(announcementValidation.createAnnouncement),
  announcementController.createAnnouncement
);

// Get all announcements (query params validated in controller)
router.get("/", announcementController.getAnnouncements);

// Get announcement statistics
router.get("/stats", announcementController.getAnnouncementStats);

// Get announcement by ID
router.get("/:id", announcementController.getAnnouncementById);

// Update announcement
router.put(
  "/:id",
  validate(announcementValidation.updateAnnouncement),
  announcementController.updateAnnouncement
);

// Delete announcement
router.delete("/:id", announcementController.deleteAnnouncement);

// Publish announcement
router.patch(
  "/:id/publish",
  validate(announcementValidation.publishAnnouncement),
  announcementController.publishAnnouncement
);

// Unpublish announcement
router.patch("/:id/unpublish", announcementController.unpublishAnnouncement);

export default router;
