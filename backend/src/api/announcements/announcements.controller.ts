import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import * as announcementService from "./announcements.service";

// Create announcement
export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const announcement = await announcementService.createAnnouncement(req.body);

    res
      .status(201)
      .json(
        new ApiResponse(201, announcement, "Announcement created successfully")
      );
  }
);

// Get all announcements with filters
export const getAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await announcementService.getAnnouncements(req.query);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Announcements retrieved successfully")
      );
  }
);

// Get active announcements (published and not expired)
export const getActiveAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await announcementService.getActiveAnnouncements(
      page,
      limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Active announcements retrieved successfully"
        )
      );
  }
);

// Get announcement by ID
export const getAnnouncementById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.getAnnouncementById(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcement,
          "Announcement retrieved successfully"
        )
      );
  }
);

// Update announcement
export const updateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.updateAnnouncement(
      id,
      req.body
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, announcement, "Announcement updated successfully")
      );
  }
);

// Delete announcement
export const deleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await announcementService.deleteAnnouncement(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Announcement deleted successfully" },
          "Announcement deleted successfully"
        )
      );
  }
);

// Publish announcement
export const publishAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { publishDate, sendNotifications } = req.body;

    const result = await announcementService.publishAnnouncement(
      id,
      publishDate ? new Date(publishDate) : undefined,
      sendNotifications !== false // Default to true
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Announcement published successfully")
      );
  }
);

// Unpublish announcement
export const unpublishAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.unpublishAnnouncement(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcement,
          "Announcement unpublished successfully"
        )
      );
  }
);

// Get announcements statistics
export const getAnnouncementStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await announcementService.getAnnouncementStats();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Announcement statistics retrieved successfully"
        )
      );
  }
);

// Mark announcement as read
export const markAnnouncementAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userId = (req as any).user.id; // From auth middleware

    await announcementService.markAnnouncementAsRead(id, userId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Announcement marked as read" },
          "Announcement marked as read successfully"
        )
      );
  }
);

// Get unread announcement count
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware

    const count = await announcementService.getUnreadCount(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, { count }, "Unread count retrieved successfully")
      );
  }
);

// Get read status of announcements
export const getMyReadStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await announcementService.getMyReadStatus(
      userId,
      page,
      limit
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Read status retrieved successfully"));
  }
);

// Toggle featured status
export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const announcement = await announcementService.toggleFeatured(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcement,
          "Featured status toggled successfully"
        )
      );
  }
);

// Archive announcement
export const archiveAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const announcement = await announcementService.archiveAnnouncement(id);

    res
      .status(200)
      .json(
        new ApiResponse(200, announcement, "Announcement archived successfully")
      );
  }
);

// Unarchive announcement
export const unarchiveAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const announcement = await announcementService.unarchiveAnnouncement(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcement,
          "Announcement unarchived successfully"
        )
      );
  }
);
