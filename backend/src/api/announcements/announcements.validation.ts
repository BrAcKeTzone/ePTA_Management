import Joi from "joi";
import { AnnouncementPriority } from "@prisma/client";

export const createAnnouncement = Joi.object().keys({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
    .optional()
    .default("MEDIUM"),
  isPublished: Joi.boolean().optional().default(true),
  publishDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date()
    .iso()
    .greater(Joi.ref("publishDate"))
    .optional()
    .allow(null)
    .messages({
      "date.greater": "Expiry date must be after publish date",
    }),
  createdById: Joi.number().integer().positive().required(),
});

export const updateAnnouncement = Joi.object().keys({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(10).optional(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
    .optional(),
  isPublished: Joi.boolean().optional(),
  publishDate: Joi.date().iso().optional().allow(null),
  expiryDate: Joi.date().iso().optional().allow(null),
});

export const getAnnouncements = Joi.object().keys({
  search: Joi.string().max(100).optional(),
  priority: Joi.string()
    .valid(...Object.values(AnnouncementPriority))
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
