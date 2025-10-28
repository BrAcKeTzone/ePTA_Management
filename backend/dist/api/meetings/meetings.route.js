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
const express_1 = __importDefault(require("express"));
const meetingsController = __importStar(require("./meetings.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const meetings_validation_1 = require("./meetings.validation");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/meetings/stats
 * @desc    Get meeting statistics
 * @access  Private (Admin only)
 */
router.get("/stats", (0, auth_middleware_1.authorize)("ADMIN"), meetingsController.getMeetingStats);
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
router.get("/", (0, validate_middleware_1.default)(meetings_validation_1.getMeetingsSchema, "query"), meetingsController.getMeetings);
/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin only)
 */
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.createMeetingSchema), meetingsController.createMeeting);
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
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.updateMeetingSchema), meetingsController.updateMeeting);
/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting
 * @access  Private (Admin only)
 */
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), meetingsController.deleteMeeting);
/**
 * @route   POST /api/meetings/:id/minutes
 * @desc    Add minutes to a meeting
 * @access  Private (Admin only)
 */
router.post("/:id/minutes", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.addMinutesSchema), meetingsController.addMinutes);
/**
 * @route   POST /api/meetings/:id/resolutions
 * @desc    Add resolutions to a meeting
 * @access  Private (Admin only)
 */
router.post("/:id/resolutions", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.addResolutionsSchema), meetingsController.addResolutions);
/**
 * @route   PUT /api/meetings/:id/quorum
 * @desc    Update quorum for a meeting
 * @access  Private (Admin only)
 */
router.put("/:id/quorum", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.updateQuorumSchema), meetingsController.updateQuorum);
/**
 * @route   POST /api/meetings/:id/notify
 * @desc    Send meeting notifications
 * @access  Private (Admin only)
 */
router.post("/:id/notify", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(meetings_validation_1.sendNotificationsSchema), meetingsController.sendNotifications);
/**
 * @route   POST /api/meetings/:id/cancel
 * @desc    Cancel a meeting
 * @access  Private (Admin only)
 */
router.post("/:id/cancel", (0, auth_middleware_1.authorize)("ADMIN"), meetingsController.cancelMeeting);
exports.default = router;
//# sourceMappingURL=meetings.route.js.map