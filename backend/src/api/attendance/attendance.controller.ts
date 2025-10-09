import { Request, Response } from "express";
import * as attendanceService from "./attendance.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

/**
 * @desc    Record attendance for a single parent
 * @route   POST /api/attendance
 * @access  Private/Admin
 */
export const recordAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const recordedById = req.user?.id;

    if (!recordedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const attendance = await attendanceService.recordAttendance(
      req.body,
      recordedById
    );

    res
      .status(201)
      .json(
        new ApiResponse(201, attendance, "Attendance recorded successfully")
      );
  }
);

/**
 * @desc    Record attendance for multiple parents in bulk
 * @route   POST /api/attendance/bulk
 * @access  Private/Admin
 */
export const bulkRecordAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const recordedById = req.user?.id;

    if (!recordedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const result = await attendanceService.bulkRecordAttendance(
      req.body,
      recordedById
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          result,
          `${result.count} attendance records created successfully`
        )
      );
  }
);

/**
 * @desc    Get attendance records with filters
 * @route   GET /api/attendance
 * @access  Private
 */
export const getAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    // Convert query params to appropriate types
    const filters = {
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      status: req.query.status as any,
      hasPenalty:
        req.query.hasPenalty === "true"
          ? true
          : req.query.hasPenalty === "false"
          ? false
          : undefined,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as any) || "createdAt",
      sortOrder: (req.query.sortOrder as any) || "desc",
    };

    const result = await attendanceService.getAttendance(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Attendance records retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get attendance record by ID
 * @route   GET /api/attendance/:id
 * @access  Private
 */
export const getAttendanceById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const attendance = await attendanceService.getAttendanceById(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          attendance,
          "Attendance record retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Update attendance record
 * @route   PUT /api/attendance/:id
 * @access  Private/Admin
 */
export const updateAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const attendance = await attendanceService.updateAttendance(id, req.body);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          attendance,
          "Attendance record updated successfully"
        )
      );
  }
);

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private/Admin
 */
export const deleteAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const result = await attendanceService.deleteAttendance(id);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Attendance record deleted successfully")
      );
  }
);

/**
 * @desc    Generate attendance report
 * @route   GET /api/attendance/report
 * @access  Private/Admin
 */
export const generateAttendanceReport = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
      includeStats: req.query.includeStats === "false" ? false : true,
      groupBy: req.query.groupBy as any,
    };

    const report = await attendanceService.generateAttendanceReport(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, report, "Attendance report generated successfully")
      );
  }
);

/**
 * @desc    Calculate penalties for attendance
 * @route   POST /api/attendance/calculate-penalties
 * @access  Private/Admin
 */
export const calculatePenalties = asyncHandler(
  async (req: Request, res: Response) => {
    const input = {
      meetingId: req.body.meetingId,
      parentId: req.body.parentId,
      applyPenalties: req.body.applyPenalties || false,
      dateFrom: req.body.dateFrom ? new Date(req.body.dateFrom) : undefined,
      dateTo: req.body.dateTo ? new Date(req.body.dateTo) : undefined,
    };

    const result = await attendanceService.calculatePenalties(input);

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Get attendance statistics
 * @route   GET /api/attendance/stats
 * @access  Private
 */
export const getAttendanceStats = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
    };

    const stats = await attendanceService.getAttendanceStats(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Attendance statistics retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get current user's attendance records
 * @route   GET /api/attendance/my-attendance
 * @access  Private/Parent
 */
export const getMyAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const attendance = await attendanceService.getMyAttendance(
      userId,
      req.query
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          attendance,
          "User attendance retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get current user's penalties
 * @route   GET /api/attendance/my-penalties
 * @access  Private/Parent
 */
export const getMyPenalties = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const penalties = await attendanceService.getMyPenalties(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, penalties, "User penalties retrieved successfully")
      );
  }
);

/**
 * @desc    Get attendance records for a specific meeting
 * @route   GET /api/attendance/meeting/:meetingId
 * @access  Private
 */
export const getAttendanceByMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = Number(req.params.meetingId);

    const attendance = await attendanceService.getAttendanceByMeeting(
      meetingId
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          attendance,
          "Meeting attendance retrieved successfully"
        )
      );
  }
);
