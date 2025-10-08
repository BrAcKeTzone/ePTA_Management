import Joi from "joi";

// Meeting types enum
export const MEETING_TYPES = {
  GENERAL: "GENERAL",
  SPECIAL: "SPECIAL",
  EMERGENCY: "EMERGENCY",
  COMMITTEE: "COMMITTEE",
  ANNUAL: "ANNUAL",
  QUARTERLY: "QUARTERLY",
} as const;

// Meeting status enum
export const MEETING_STATUS = {
  SCHEDULED: "SCHEDULED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  POSTPONED: "POSTPONED",
} as const;

// Time format validation (HH:MM in 24-hour format)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validation schema for creating a meeting
 */
export const createMeetingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description cannot exceed 2000 characters",
    }),

  meetingType: Joi.string()
    .valid(...Object.values(MEETING_TYPES))
    .default("GENERAL")
    .messages({
      "string.base": "Meeting type must be a string",
      "any.only": `Meeting type must be one of: ${Object.values(
        MEETING_TYPES
      ).join(", ")}`,
    }),

  date: Joi.date().iso().min("now").required().messages({
    "date.base": "Date must be a valid date",
    "date.min": "Meeting date cannot be in the past",
    "any.required": "Meeting date is required",
  }),

  startTime: Joi.string().pattern(timeRegex).required().messages({
    "string.base": "Start time must be a string",
    "string.pattern.base": "Start time must be in HH:MM format (24-hour)",
    "any.required": "Start time is required",
  }),

  endTime: Joi.string().pattern(timeRegex).optional().allow("", null).messages({
    "string.base": "End time must be a string",
    "string.pattern.base": "End time must be in HH:MM format (24-hour)",
  }),

  venue: Joi.string().trim().min(3).max(200).required().messages({
    "string.base": "Venue must be a string",
    "string.empty": "Venue is required",
    "string.min": "Venue must be at least 3 characters",
    "string.max": "Venue cannot exceed 200 characters",
    "any.required": "Venue is required",
  }),

  isVirtual: Joi.boolean().default(false).messages({
    "boolean.base": "isVirtual must be a boolean",
  }),

  meetingLink: Joi.string()
    .trim()
    .uri()
    .max(500)
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Meeting link must be a string",
      "string.uri": "Meeting link must be a valid URL",
      "string.max": "Meeting link cannot exceed 500 characters",
    }),

  agenda: Joi.string().trim().max(5000).optional().allow("", null).messages({
    "string.base": "Agenda must be a string",
    "string.max": "Agenda cannot exceed 5000 characters",
  }),

  expectedAttendees: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Expected attendees must be a number",
    "number.integer": "Expected attendees must be a whole number",
    "number.min": "Expected attendees cannot be negative",
  }),
});

/**
 * Validation schema for updating a meeting
 */
export const updateMeetingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.base": "Title must be a string",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 200 characters",
  }),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description cannot exceed 2000 characters",
    }),

  meetingType: Joi.string()
    .valid(...Object.values(MEETING_TYPES))
    .optional()
    .messages({
      "string.base": "Meeting type must be a string",
      "any.only": `Meeting type must be one of: ${Object.values(
        MEETING_TYPES
      ).join(", ")}`,
    }),

  status: Joi.string()
    .valid(...Object.values(MEETING_STATUS))
    .optional()
    .messages({
      "string.base": "Meeting status must be a string",
      "any.only": `Meeting status must be one of: ${Object.values(
        MEETING_STATUS
      ).join(", ")}`,
    }),

  date: Joi.date().iso().optional().messages({
    "date.base": "Date must be a valid date",
  }),

  startTime: Joi.string().pattern(timeRegex).optional().messages({
    "string.base": "Start time must be a string",
    "string.pattern.base": "Start time must be in HH:MM format (24-hour)",
  }),

  endTime: Joi.string().pattern(timeRegex).optional().allow("", null).messages({
    "string.base": "End time must be a string",
    "string.pattern.base": "End time must be in HH:MM format (24-hour)",
  }),

  venue: Joi.string().trim().min(3).max(200).optional().messages({
    "string.base": "Venue must be a string",
    "string.min": "Venue must be at least 3 characters",
    "string.max": "Venue cannot exceed 200 characters",
  }),

  isVirtual: Joi.boolean().optional().messages({
    "boolean.base": "isVirtual must be a boolean",
  }),

  meetingLink: Joi.string()
    .trim()
    .uri()
    .max(500)
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Meeting link must be a string",
      "string.uri": "Meeting link must be a valid URL",
      "string.max": "Meeting link cannot exceed 500 characters",
    }),

  agenda: Joi.string().trim().max(5000).optional().allow("", null).messages({
    "string.base": "Agenda must be a string",
    "string.max": "Agenda cannot exceed 5000 characters",
  }),

  expectedAttendees: Joi.number().integer().min(0).optional().messages({
    "number.base": "Expected attendees must be a number",
    "number.integer": "Expected attendees must be a whole number",
    "number.min": "Expected attendees cannot be negative",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Validation schema for adding minutes to a meeting
 */
export const addMinutesSchema = Joi.object({
  minutes: Joi.string().trim().min(10).max(50000).required().messages({
    "string.base": "Minutes must be a string",
    "string.empty": "Minutes content is required",
    "string.min": "Minutes must be at least 10 characters",
    "string.max": "Minutes cannot exceed 50000 characters",
    "any.required": "Minutes content is required",
  }),
});

/**
 * Validation schema for adding resolutions to a meeting
 */
export const addResolutionsSchema = Joi.object({
  resolutions: Joi.string().trim().min(10).max(50000).required().messages({
    "string.base": "Resolutions must be a string",
    "string.empty": "Resolutions content is required",
    "string.min": "Resolutions must be at least 10 characters",
    "string.max": "Resolutions cannot exceed 50000 characters",
    "any.required": "Resolutions content is required",
  }),
});

/**
 * Validation schema for updating quorum
 */
export const updateQuorumSchema = Joi.object({
  actualAttendees: Joi.number().integer().min(0).required().messages({
    "number.base": "Actual attendees must be a number",
    "number.integer": "Actual attendees must be a whole number",
    "number.min": "Actual attendees cannot be negative",
    "any.required": "Actual attendees is required",
  }),
});

/**
 * Validation schema for querying meetings
 */
export const getMeetingsSchema = Joi.object({
  search: Joi.string().trim().max(200).optional().messages({
    "string.base": "Search must be a string",
    "string.max": "Search cannot exceed 200 characters",
  }),

  meetingType: Joi.string()
    .valid(...Object.values(MEETING_TYPES))
    .optional()
    .messages({
      "string.base": "Meeting type must be a string",
      "any.only": `Meeting type must be one of: ${Object.values(
        MEETING_TYPES
      ).join(", ")}`,
    }),

  status: Joi.string()
    .valid(...Object.values(MEETING_STATUS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of: ${Object.values(MEETING_STATUS).join(
        ", "
      )}`,
    }),

  fromDate: Joi.date().iso().optional().messages({
    "date.base": "From date must be a valid date",
  }),

  toDate: Joi.date().iso().min(Joi.ref("fromDate")).optional().messages({
    "date.base": "To date must be a valid date",
    "date.min": "To date must be after from date",
  }),

  year: Joi.number().integer().min(2020).max(2100).optional().messages({
    "number.base": "Year must be a number",
    "number.integer": "Year must be a whole number",
    "number.min": "Year must be 2020 or later",
    "number.max": "Year must be 2100 or earlier",
  }),

  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be a whole number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be a whole number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

/**
 * Validation schema for sending notifications
 */
export const sendNotificationsSchema = Joi.object({
  targetAudience: Joi.string()
    .valid("ALL", "PARENTS", "ADMINS")
    .default("ALL")
    .messages({
      "string.base": "Target audience must be a string",
      "any.only": "Target audience must be one of: ALL, PARENTS, ADMINS",
    }),

  customMessage: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Custom message must be a string",
      "string.max": "Custom message cannot exceed 1000 characters",
    }),
});
