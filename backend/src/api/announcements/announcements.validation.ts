import Joi from "joi";
import { AnnouncementPriority, TargetAudience } from "@prisma/client";

export const createAnnouncement = Joi.object().keys({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
    .optional()
    .default("MEDIUM"),
  targetAudience: Joi.string()
    .valid(...Object.values(TargetAudience))
    .optional()
    .default("ALL"),
  targetProgram: Joi.string().optional().allow(""),
  targetYearLevel: Joi.string().optional().allow(""),
  isPublished: Joi.boolean().optional().default(false),
  publishDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date()
    .iso()
    .greater(Joi.ref("publishDate"))
    .optional()
    .allow(null)
    .messages({
      "date.greater": "Expiry date must be after publish date",
    }),
  attachmentUrl: Joi.string().uri().optional().allow(""),
  attachmentName: Joi.string().max(255).optional().allow(""),
  createdById: Joi.number().integer().positive().required(),
});

export const updateAnnouncement = Joi.object().keys({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(10).optional(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
    .optional(),
  targetAudience: Joi.string()
    .valid(...Object.values(TargetAudience))
    .optional(),
  targetProgram: Joi.string().optional().allow(""),
  targetYearLevel: Joi.string().optional().allow(""),
  publishDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date().iso().optional().allow(null),
  attachmentUrl: Joi.string().uri().optional().allow(""),
  attachmentName: Joi.string().max(255).optional().allow(""),
});

export const getAnnouncements = Joi.object().keys({
  search: Joi.string().max(100).optional(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
    .optional(),
  targetAudience: Joi.string()
    .valid(...Object.values(TargetAudience))
    .optional(),
  isPublished: Joi.boolean().optional(),
  createdById: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const announcementIdParam = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
});

export const publishAnnouncement = Joi.object().keys({
  publishDate: Joi.date().iso().optional(),
  sendNotifications: Joi.boolean().optional().default(true),
});

export const getPaginated = Joi.object().keys({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
