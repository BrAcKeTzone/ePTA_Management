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
exports.getMyReadStatus = exports.getUnreadCount = exports.markAnnouncementAsRead = exports.getAnnouncementStats = exports.unpublishAnnouncement = exports.publishAnnouncement = exports.deleteAnnouncement = exports.updateAnnouncement = exports.getAnnouncementById = exports.getActiveAnnouncements = exports.getAnnouncements = exports.createAnnouncement = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const announcementService = __importStar(require("./announcements.service"));
// Create announcement
exports.createAnnouncement = (0, asyncHandler_1.default)(async (req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, announcement, "Announcement created successfully"));
});
// Get all announcements with filters
exports.getAnnouncements = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await announcementService.getAnnouncements(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Announcements retrieved successfully"));
});
// Get active announcements (published and not expired)
exports.getActiveAnnouncements = (0, asyncHandler_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await announcementService.getActiveAnnouncements(page, limit);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Active announcements retrieved successfully"));
});
// Get announcement by ID
exports.getAnnouncementById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.getAnnouncementById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, announcement, "Announcement retrieved successfully"));
});
// Update announcement
exports.updateAnnouncement = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.updateAnnouncement(id, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, announcement, "Announcement updated successfully"));
});
// Delete announcement
exports.deleteAnnouncement = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    await announcementService.deleteAnnouncement(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { message: "Announcement deleted successfully" }, "Announcement deleted successfully"));
});
// Publish announcement
exports.publishAnnouncement = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const { publishDate, sendNotifications } = req.body;
    const result = await announcementService.publishAnnouncement(id, publishDate ? new Date(publishDate) : undefined, sendNotifications !== false // Default to true
    );
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Announcement published successfully"));
});
// Unpublish announcement
exports.unpublishAnnouncement = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const announcement = await announcementService.unpublishAnnouncement(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, announcement, "Announcement unpublished successfully"));
});
// Get announcements statistics
exports.getAnnouncementStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await announcementService.getAnnouncementStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Announcement statistics retrieved successfully"));
});
// Mark announcement as read
exports.markAnnouncementAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.id; // From auth middleware
    await announcementService.markAnnouncementAsRead(id, userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { message: "Announcement marked as read" }, "Announcement marked as read successfully"));
});
// Get unread announcement count
exports.getUnreadCount = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const count = await announcementService.getUnreadCount(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, { count }, "Unread count retrieved successfully"));
});
// Get read status of announcements
exports.getMyReadStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await announcementService.getMyReadStatus(userId, page, limit);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Read status retrieved successfully"));
});
//# sourceMappingURL=announcements.controller.js.map