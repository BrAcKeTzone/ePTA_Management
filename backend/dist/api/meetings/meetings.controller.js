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
exports.cancelMeeting = exports.sendNotifications = exports.getMeetingStats = exports.getUpcomingMeetings = exports.getMeetingHistory = exports.updateQuorum = exports.addResolutions = exports.addMinutes = exports.deleteMeeting = exports.updateMeeting = exports.getMeetingById = exports.getMeetings = exports.createMeeting = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const meetingService = __importStar(require("./meetings.service"));
/**
 * @desc    Create a new meeting
 * @route   POST /api/meetings
 * @access  Private (Admin only)
 */
exports.createMeeting = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const meeting = await meetingService.createMeeting(req.body, userId);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, meeting, "Meeting created successfully"));
});
/**
 * @desc    Get all meetings with filtering and pagination
 * @route   GET /api/meetings
 * @access  Private
 */
exports.getMeetings = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, meetingType, status, fromDate, toDate, year, page = 1, limit = 10, } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {};
    if (search)
        filters.search = search;
    if (meetingType)
        filters.meetingType = meetingType;
    if (status)
        filters.status = status;
    if (fromDate)
        filters.fromDate = new Date(fromDate);
    if (toDate)
        filters.toDate = new Date(toDate);
    if (year)
        filters.year = parseInt(year, 10);
    const result = await meetingService.getMeetings(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Meetings retrieved successfully"));
});
/**
 * @desc    Get meeting by ID
 * @route   GET /api/meetings/:id
 * @access  Private
 */
exports.getMeetingById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.getMeetingById(meetingId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Meeting retrieved successfully"));
});
/**
 * @desc    Update meeting
 * @route   PUT /api/meetings/:id
 * @access  Private (Admin only)
 */
exports.updateMeeting = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.updateMeeting(meetingId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Meeting updated successfully"));
});
/**
 * @desc    Delete meeting
 * @route   DELETE /api/meetings/:id
 * @access  Private (Admin only)
 */
exports.deleteMeeting = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const result = await meetingService.deleteMeeting(meetingId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Meeting deleted successfully"));
});
/**
 * @desc    Add minutes to a meeting
 * @route   POST /api/meetings/:id/minutes
 * @access  Private (Admin only)
 */
exports.addMinutes = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { minutes } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.addMinutes(meetingId, minutes, userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Minutes added successfully"));
});
/**
 * @desc    Add resolutions to a meeting
 * @route   POST /api/meetings/:id/resolutions
 * @access  Private (Admin only)
 */
exports.addResolutions = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { resolutions } = req.body;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.addResolutions(meetingId, resolutions);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Resolutions added successfully"));
});
/**
 * @desc    Update quorum for a meeting
 * @route   PUT /api/meetings/:id/quorum
 * @access  Private (Admin only)
 */
exports.updateQuorum = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { actualAttendees } = req.body;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.updateQuorum(meetingId, actualAttendees);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Quorum updated successfully"));
});
/**
 * @desc    Get meeting history
 * @route   GET /api/meetings/history
 * @access  Private
 */
exports.getMeetingHistory = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const result = await meetingService.getMeetingHistory(pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Meeting history retrieved successfully"));
});
/**
 * @desc    Get upcoming meetings
 * @route   GET /api/meetings/upcoming
 * @access  Private
 */
exports.getUpcomingMeetings = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const result = await meetingService.getUpcomingMeetings(pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Upcoming meetings retrieved successfully"));
});
/**
 * @desc    Get meeting statistics
 * @route   GET /api/meetings/stats
 * @access  Private (Admin only)
 */
exports.getMeetingStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await meetingService.getMeetingStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Meeting statistics retrieved successfully"));
});
/**
 * @desc    Send meeting notifications
 * @route   POST /api/meetings/:id/notify
 * @access  Private (Admin only)
 */
exports.sendNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { targetAudience = "ALL", customMessage } = req.body;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const result = await meetingService.sendMeetingNotifications(meetingId, targetAudience, customMessage);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, `Notifications sent: ${result.sent} successful, ${result.failed} failed`));
});
/**
 * @desc    Cancel a meeting
 * @route   POST /api/meetings/:id/cancel
 * @access  Private (Admin only)
 */
exports.cancelMeeting = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const meetingId = parseInt(id, 10);
    if (isNaN(meetingId)) {
        throw new ApiError_1.default(400, "Invalid meeting ID");
    }
    const meeting = await meetingService.cancelMeeting(meetingId, reason);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, meeting, "Meeting cancelled successfully"));
});
//# sourceMappingURL=meetings.controller.js.map