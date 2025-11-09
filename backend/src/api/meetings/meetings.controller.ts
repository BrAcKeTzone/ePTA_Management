import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import * as meetingService from "./meetings.service";
import { MeetingType, MeetingStatus } from "@prisma/client";

/**
 * @desc    Create a new meeting
 * @route   POST /api/meetings
 * @access  Private (Admin only)
 */
export const createMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const meeting = await meetingService.createMeeting(req.body, userId);

    res
      .status(201)
      .json(new ApiResponse(201, meeting, "Meeting created successfully"));
  }
);

/**
 * @desc    Get all meetings with filtering and pagination
 * @route   GET /api/meetings
 * @access  Private
 */
export const getMeetings = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    meetingType,
    status,
    fromDate,
    toDate,
    year,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  const filters: meetingService.MeetingSearchFilters = {};

  if (search) filters.search = search as string;
  if (meetingType) filters.meetingType = meetingType as MeetingType;
  if (status) filters.status = status as MeetingStatus;
  if (fromDate) filters.fromDate = new Date(fromDate as string);
  if (toDate) filters.toDate = new Date(toDate as string);
  if (year) filters.year = parseInt(year as string, 10);

  const result = await meetingService.getMeetings(filters, pageNum, limitNum);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Meetings retrieved successfully"));
});

/**
 * @desc    Get meeting by ID
 * @route   GET /api/meetings/:id
 * @access  Private
 */
export const getMeetingById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const meeting = await meetingService.getMeetingById(meetingId);

    res
      .status(200)
      .json(new ApiResponse(200, meeting, "Meeting retrieved successfully"));
  }
);

/**
 * @desc    Update meeting
 * @route   PUT /api/meetings/:id
 * @access  Private (Admin only)
 */
export const updateMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const meeting = await meetingService.updateMeeting(meetingId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, meeting, "Meeting updated successfully"));
  }
);

/**
 * @desc    Delete meeting
 * @route   DELETE /api/meetings/:id
 * @access  Private (Admin only)
 */
export const deleteMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const result = await meetingService.deleteMeeting(meetingId);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Meeting deleted successfully"));
  }
);

/**
 * @desc    Add minutes to a meeting
 * @route   POST /api/meetings/:id/minutes
 * @access  Private (Admin only)
 */
export const addMinutes = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { minutes } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const meetingId = parseInt(id, 10);

  if (isNaN(meetingId)) {
    throw new ApiError(400, "Invalid meeting ID");
  }

  const meeting = await meetingService.addMinutes(meetingId, minutes, userId);

  res
    .status(200)
    .json(new ApiResponse(200, meeting, "Minutes added successfully"));
});

/**
 * @desc    Add resolutions to a meeting
 * @route   POST /api/meetings/:id/resolutions
 * @access  Private (Admin only)
 */
export const addResolutions = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { resolutions } = req.body;

    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const meeting = await meetingService.addResolutions(meetingId, resolutions);

    res
      .status(200)
      .json(new ApiResponse(200, meeting, "Resolutions added successfully"));
  }
);

/**
 * @desc    Update quorum for a meeting
 * @route   PUT /api/meetings/:id/quorum
 * @access  Private (Admin only)
 */
export const updateQuorum = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { actualAttendees } = req.body;

    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const meeting = await meetingService.updateQuorum(
      meetingId,
      actualAttendees
    );

    res
      .status(200)
      .json(new ApiResponse(200, meeting, "Quorum updated successfully"));
  }
);

/**
 * @desc    Get meeting history
 * @route   GET /api/meetings/history
 * @access  Private
 */
export const getMeetingHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const result = await meetingService.getMeetingHistory(pageNum, limitNum);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Meeting history retrieved successfully")
      );
  }
);

/**
 * @desc    Get upcoming meetings
 * @route   GET /api/meetings/upcoming
 * @access  Private
 */
export const getUpcomingMeetings = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const result = await meetingService.getUpcomingMeetings(pageNum, limitNum);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Upcoming meetings retrieved successfully")
      );
  }
);

/**
 * @desc    Get meeting statistics
 * @route   GET /api/meetings/stats
 * @access  Private (Admin only)
 */
export const getMeetingStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await meetingService.getMeetingStats();

    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Meeting statistics retrieved successfully")
      );
  }
);

/**
 * @desc    Send meeting notifications
 * @route   POST /api/meetings/:id/notify
 * @access  Private (Admin only)
 */
export const sendNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetAudience = "ALL", customMessage } = req.body;

    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const result = await meetingService.sendMeetingNotifications(
      meetingId,
      targetAudience,
      customMessage
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Notifications sent: ${result.sent} successful, ${result.failed} failed`
        )
      );
  }
);

/**
 * @desc    Cancel a meeting
 * @route   POST /api/meetings/:id/cancel
 * @access  Private (Admin only)
 */
export const cancelMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const meeting = await meetingService.cancelMeeting(meetingId, reason);

    res
      .status(200)
      .json(new ApiResponse(200, meeting, "Meeting cancelled successfully"));
  }
);

/**
 * @desc    Generate QR code for meeting
 * @route   POST /api/meetings/:id/qr-code
 * @access  Private (Admin only)
 */
export const generateQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);

    if (isNaN(meetingId)) {
      throw new ApiError(400, "Invalid meeting ID");
    }

    const qrData = await meetingService.generateMeetingQRCode(meetingId);

    res
      .status(200)
      .json(new ApiResponse(200, qrData, "QR code generated successfully"));
  }
);

/**
 * @desc    Get QR code data URL for meeting (for display)
 * @route   GET /api/meetings/:id/qr-code
 * @access  Private
 */
export const getQRCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const meetingId = parseInt(id, 10);

  if (isNaN(meetingId)) {
    throw new ApiError(400, "Invalid meeting ID");
  }

  const meeting = await meetingService.getMeetingById(meetingId);

  if (!meeting.qrCode) {
    throw new ApiError(404, "QR code not found for this meeting");
  }

  // Regenerate QR code data URL
  const qrData = JSON.stringify({
    meetingId: meetingId,
    qrCodeId: meeting.qrCode,
    timestamp: Date.now(),
  });

  const QRCode = require("qrcode");
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        qrCode: meeting.qrCode,
        qrCodeDataUrl,
        expiresAt: meeting.qrCodeExpiresAt,
        isActive: meeting.qrCodeActive,
      },
      "QR code retrieved successfully"
    )
  );
});

/**
 * @desc    Scan QR code to mark attendance
 * @route   POST /api/meetings/scan-qr
 * @access  Private (Parent only)
 */
export const scanQRCode = asyncHandler(async (req: Request, res: Response) => {
  const { qrCodeData } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  if (!qrCodeData) {
    throw new ApiError(400, "QR code data is required");
  }

  const result = await meetingService.scanQRCodeForAttendance(
    qrCodeData,
    userId
  );

  if (result.success) {
    res
      .status(200)
      .json(new ApiResponse(200, result.attendance, result.message));
  } else {
    throw new ApiError(400, result.message);
  }
});
