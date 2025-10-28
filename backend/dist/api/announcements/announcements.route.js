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
const announcementController = __importStar(require("./announcements.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const announcementValidation = __importStar(require("./announcements.validation"));
const router = express_1.default.Router();
// Public routes (no auth required)
router.get("/active", announcementController.getActiveAnnouncements);
// Protected routes (auth required)
router.use(auth_middleware_1.authenticate);
// Get unread count (must be before /:id route)
router.get("/unread-count", announcementController.getUnreadCount);
// Get my read status (must be before /:id route)
router.get("/my-read-status", announcementController.getMyReadStatus);
// Mark announcement as read
router.post("/:id/read", announcementController.markAnnouncementAsRead);
// Announcement CRUD operations
router.post("/", (0, validate_middleware_1.default)(announcementValidation.createAnnouncement), announcementController.createAnnouncement);
// Get all announcements (query params validated in controller)
router.get("/", announcementController.getAnnouncements);
// Get announcement statistics
router.get("/stats", announcementController.getAnnouncementStats);
// Get announcement by ID
router.get("/:id", announcementController.getAnnouncementById);
// Update announcement
router.put("/:id", (0, validate_middleware_1.default)(announcementValidation.updateAnnouncement), announcementController.updateAnnouncement);
// Delete announcement
router.delete("/:id", announcementController.deleteAnnouncement);
// Publish announcement
router.patch("/:id/publish", (0, validate_middleware_1.default)(announcementValidation.publishAnnouncement), announcementController.publishAnnouncement);
// Unpublish announcement
router.patch("/:id/unpublish", announcementController.unpublishAnnouncement);
exports.default = router;
//# sourceMappingURL=announcements.route.js.map