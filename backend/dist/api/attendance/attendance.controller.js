"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceByMeeting = exports.getMyPenalties = exports.getMyAttendance = exports.getAttendanceStats = exports.calculatePenalties = exports.generateAttendanceReport = exports.deleteAttendance = exports.updateAttendance = exports.getAttendanceById = exports.getAttendance = exports.bulkRecordAttendance = exports.recordAttendance = void 0;
const attendanceService = __importStar(require("./attendance.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
/**
 * @desc    Record attendance for a single parent
 * @route   POST /api/attendance
 * @access  Private/Admin
 */
exports.recordAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    const recordedById = req.user?.id;
    if (!recordedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const attendance = await attendanceService.recordAttendance(req.body, recordedById);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, attendance, "Attendance recorded successfully"));
});
/**
 * @desc    Record attendance for multiple parents in bulk
 * @route   POST /api/attendance/bulk
 * @access  Private/Admin
 */
exports.bulkRecordAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    const recordedById = req.user?.id;
    if (!recordedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const result = await attendanceService.bulkRecordAttendance(req.body, recordedById);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, result, `${result.count} attendance records created successfully`));
});
/**
 * @desc    Get attendance records with filters
 * @route   GET /api/attendance
 * @access  Private
 */
exports.getAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    // Convert query params to appropriate types
    const filters = {
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        status: req.query.status,
        hasPenalty: req.query.hasPenalty === "true"
            ? true
            : req.query.hasPenalty === "false"
                ? false
                : undefined,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
    };
    const result = await attendanceService.getAttendance(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Attendance records retrieved successfully"));
});
/**
 * @desc    Get attendance record by ID
 * @route   GET /api/attendance/:id
 * @access  Private
 */
exports.getAttendanceById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const attendance = await attendanceService.getAttendanceById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, attendance, "Attendance record retrieved successfully"));
});
/**
 * @desc    Update attendance record
 * @route   PUT /api/attendance/:id
 * @access  Private/Admin
 */
exports.updateAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const attendance = await attendanceService.updateAttendance(id, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, attendance, "Attendance record updated successfully"));
});
/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private/Admin
 */
exports.deleteAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await attendanceService.deleteAttendance(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Attendance record deleted successfully"));
});
/**
 * @desc    Generate attendance report
 * @route   GET /api/attendance/report
 * @access  Private/Admin
 */
exports.generateAttendanceReport = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        dateFrom: new Date(req.query.dateFrom),
        dateTo: new Date(req.query.dateTo),
        includeStats: req.query.includeStats === "false" ? false : true,
        groupBy: req.query.groupBy,
    };
    const report = await attendanceService.generateAttendanceReport(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, report, "Attendance report generated successfully"));
});
/**
 * @desc    Calculate penalties for attendance
 * @route   POST /api/attendance/calculate-penalties
 * @access  Private/Admin
 */
exports.calculatePenalties = (0, asyncHandler_1.default)(async (req, res) => {
    const input = {
        meetingId: req.body.meetingId,
        parentId: req.body.parentId,
        applyPenalties: req.body.applyPenalties || false,
        dateFrom: req.body.dateFrom ? new Date(req.body.dateFrom) : undefined,
        dateTo: req.body.dateTo ? new Date(req.body.dateTo) : undefined,
    };
    const result = await attendanceService.calculatePenalties(input);
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Get attendance statistics
 * @route   GET /api/attendance/stats
 * @access  Private
 */
exports.getAttendanceStats = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
    };
    const stats = await attendanceService.getAttendanceStats(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Attendance statistics retrieved successfully"));
});
/**
 * @desc    Get current user's attendance records
 * @route   GET /api/attendance/my-attendance
 * @access  Private/Parent
 */
exports.getMyAttendance = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const attendance = await attendanceService.getMyAttendance(userId, req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, attendance, "User attendance retrieved successfully"));
});
/**
 * @desc    Get current user's penalties
 * @route   GET /api/attendance/my-penalties
 * @access  Private/Parent
 */
exports.getMyPenalties = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const penalties = await attendanceService.getMyPenalties(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, penalties, "User penalties retrieved successfully"));
});
/**
 * @desc    Get attendance records for a specific meeting
 * @route   GET /api/attendance/meeting/:meetingId
 * @access  Private
 */
exports.getAttendanceByMeeting = (0, asyncHandler_1.default)(async (req, res) => {
    const meetingId = Number(req.params.meetingId);
    const attendance = await attendanceService.getAttendanceByMeeting(meetingId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, attendance, "Meeting attendance retrieved successfully"));
});
//# sourceMappingURL=attendance.controller.js.map