import Joi from "joi";

export const searchParentStudentSchema = Joi.object().keys({
  q: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Search query is required",
    "string.min": "Search query must be at least 1 character",
    "string.max": "Search query cannot exceed 100 characters",
  }),
});

export const verifyClearanceSchema = Joi.object().keys({
  parentId: Joi.number().integer().positive().required().messages({
    "number.base": "Parent ID must be a number",
    "number.positive": "Parent ID must be positive",
    "any.required": "Parent ID is required",
  }),
  studentId: Joi.number().integer().positive().optional().messages({
    "number.base": "Student ID must be a number",
    "number.positive": "Student ID must be positive",
  }),
});

export const clearanceDetailsSchema = Joi.object().keys({
  parentId: Joi.number().integer().positive().required().messages({
    "number.base": "Parent ID must be a number",
    "number.positive": "Parent ID must be positive",
    "any.required": "Parent ID is required",
  }),
  studentId: Joi.number().integer().positive().optional().messages({
    "number.base": "Student ID must be a number",
    "number.positive": "Student ID must be positive",
  }),
});

export const requestClearanceSchema = Joi.object().keys({
  purpose: Joi.string().min(5).max(500).required().messages({
    "string.empty": "Purpose is required",
    "string.min": "Purpose must be at least 5 characters",
    "string.max": "Purpose cannot exceed 500 characters",
  }),
  studentId: Joi.number().integer().positive().optional().messages({
    "number.base": "Student ID must be a number",
    "number.positive": "Student ID must be positive",
  }),
});

export const clearanceRequestParamsSchema = Joi.object().keys({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.string()
    .valid("PENDING", "APPROVED", "REJECTED", "pending", "approved", "rejected")
    .uppercase()
    .optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "purpose")
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
});

export const rejectClearanceSchema = Joi.object().keys({
  reason: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Rejection reason cannot exceed 500 characters",
  }),
});

export const clearanceStatsSchema = Joi.object().keys({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  parentId: Joi.number().integer().positive().optional(),
});

export const clearanceIdParam = Joi.object().keys({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Clearance request ID must be a number",
    "number.positive": "Clearance request ID must be positive",
    "any.required": "Clearance request ID is required",
  }),
});

export const bulkVerifySchema = Joi.object().keys({
  parentIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one parent ID is required",
      "array.max": "Cannot verify more than 50 parents at once",
      "any.required": "Parent IDs array is required",
    }),
});
