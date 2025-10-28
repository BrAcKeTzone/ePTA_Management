"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginated = exports.publishAnnouncement = exports.announcementIdParam = exports.getAnnouncements = exports.updateAnnouncement = exports.createAnnouncement = void 0;
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
exports.createAnnouncement = joi_1.default.object().keys({
    title: joi_1.default.string().min(3).max(200).required(),
    content: joi_1.default.string().min(10).required(),
    priority: joi_1.default.string()
        .valid(...Object.values(client_1.AnnouncementPriority))
        .optional()
        .default("MEDIUM"),
    targetAudience: joi_1.default.string()
        .valid(...Object.values(client_1.TargetAudience))
        .optional()
        .default("ALL"),
    targetProgram: joi_1.default.string().optional().allow(""),
    targetYearLevel: joi_1.default.string().optional().allow(""),
    isPublished: joi_1.default.boolean().optional().default(false),
    publishDate: joi_1.default.date().iso().optional().allow(null),
    expiryDate: joi_1.default.date()
        .iso()
        .greater(joi_1.default.ref("publishDate"))
        .optional()
        .allow(null)
        .messages({
        "date.greater": "Expiry date must be after publish date",
    }),
    attachmentUrl: joi_1.default.string().uri().optional().allow(""),
    attachmentName: joi_1.default.string().max(255).optional().allow(""),
    createdById: joi_1.default.number().integer().positive().required(),
});
exports.updateAnnouncement = joi_1.default.object().keys({
    title: joi_1.default.string().min(3).max(200).optional(),
    content: joi_1.default.string().min(10).optional(),
    priority: joi_1.default.string()
        .valid(...Object.values(client_1.AnnouncementPriority))
        .optional(),
    targetAudience: joi_1.default.string()
        .valid(...Object.values(client_1.TargetAudience))
        .optional(),
    targetProgram: joi_1.default.string().optional().allow(""),
    targetYearLevel: joi_1.default.string().optional().allow(""),
    publishDate: joi_1.default.date().iso().optional().allow(null),
    expiryDate: joi_1.default.date().iso().optional().allow(null),
    attachmentUrl: joi_1.default.string().uri().optional().allow(""),
    attachmentName: joi_1.default.string().max(255).optional().allow(""),
});
exports.getAnnouncements = joi_1.default.object().keys({
    search: joi_1.default.string().max(100).optional(),
    priority: joi_1.default.string()
        .valid(...Object.values(client_1.AnnouncementPriority))
        .optional(),
    targetAudience: joi_1.default.string()
        .valid(...Object.values(client_1.TargetAudience))
        .optional(),
    isPublished: joi_1.default.boolean().optional(),
    createdById: joi_1.default.number().integer().positive().optional(),
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
exports.announcementIdParam = joi_1.default.object().keys({
    id: joi_1.default.number().integer().positive().required(),
});
exports.publishAnnouncement = joi_1.default.object().keys({
    publishDate: joi_1.default.date().iso().optional(),
    sendNotifications: joi_1.default.boolean().optional().default(true),
});
exports.getPaginated = joi_1.default.object().keys({
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
//# sourceMappingURL=announcements.validation.js.map