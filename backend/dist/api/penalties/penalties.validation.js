"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRemindersSchema = exports.penaltyStatsSchema = exports.penaltyReportSchema = exports.getPenaltiesSchema = exports.waivePenaltySchema = exports.updatePenaltySchema = exports.recordPaymentSchema = exports.createPenaltySchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for creating a penalty
 */
exports.createPenaltySchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
        "any.required": "Parent ID is required",
    }),
    meetingId: joi_1.default.number().integer().positive().optional().allow(null).messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    amount: joi_1.default.number().positive().required().messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be positive",
        "any.required": "Amount is required",
    }),
    reason: joi_1.default.string().min(3).max(2000).required().messages({
        "string.base": "Reason must be a string",
        "string.min": "Reason must be at least 3 characters",
        "string.max": "Reason cannot exceed 2000 characters",
        "any.required": "Reason is required",
    }),
    dueDate: joi_1.default.date().iso().optional().messages({
        "date.base": "Due date must be a valid date",
        "date.format": "Due date must be in ISO format",
    }),
    discountAmount: joi_1.default.number().min(0).optional().messages({
        "number.base": "Discount amount must be a number",
        "number.min": "Discount amount cannot be negative",
    }),
    discountReason: joi_1.default.string().max(500).optional().allow("").messages({
        "string.base": "Discount reason must be a string",
        "string.max": "Discount reason cannot exceed 500 characters",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
/**
 * Validation schema for recording a payment
 */
exports.recordPaymentSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required().messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be positive",
        "any.required": "Amount is required",
    }),
    method: joi_1.default.string()
        .valid("CASH", "BANK_TRANSFER", "GCASH", "PAYMAYA", "CHECK", "OTHER")
        .required()
        .messages({
        "string.base": "Payment method must be a string",
        "any.only": "Payment method must be one of: CASH, BANK_TRANSFER, GCASH, PAYMAYA, CHECK, OTHER",
        "any.required": "Payment method is required",
    }),
    reference: joi_1.default.string().max(100).optional().allow("", null).messages({
        "string.base": "Reference must be a string",
        "string.max": "Reference cannot exceed 100 characters",
    }),
    notes: joi_1.default.string().max(1000).optional().allow("", null).messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 1000 characters",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
/**
 * Validation schema for updating a penalty
 */
exports.updatePenaltySchema = joi_1.default.object({
    amount: joi_1.default.number().positive().optional().messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be positive",
    }),
    reason: joi_1.default.string().min(3).max(2000).optional().messages({
        "string.base": "Reason must be a string",
        "string.min": "Reason must be at least 3 characters",
        "string.max": "Reason cannot exceed 2000 characters",
    }),
    dueDate: joi_1.default.date().iso().optional().allow(null).messages({
        "date.base": "Due date must be a valid date",
        "date.format": "Due date must be in ISO format",
    }),
    discountAmount: joi_1.default.number().min(0).optional().messages({
        "number.base": "Discount amount must be a number",
        "number.min": "Discount amount cannot be negative",
    }),
    discountReason: joi_1.default.string().max(500).optional().allow("", null).messages({
        "string.base": "Discount reason must be a string",
        "string.max": "Discount reason cannot exceed 500 characters",
    }),
})
    .min(1)
    .messages({
    "object.base": "Request body must be a valid object",
    "object.min": "At least one field must be provided for update",
});
/**
 * Validation schema for waiving a penalty
 */
exports.waivePenaltySchema = joi_1.default.object({
    waiverReason: joi_1.default.string().min(3).max(1000).required().messages({
        "string.base": "Waiver reason must be a string",
        "string.min": "Waiver reason must be at least 3 characters",
        "string.max": "Waiver reason cannot exceed 1000 characters",
        "any.required": "Waiver reason is required",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
/**
 * Validation schema for getting penalties with filters
 */
exports.getPenaltiesSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    paymentStatus: joi_1.default.string()
        .valid("UNPAID", "PARTIAL", "PAID", "WAIVED", "OVERDUE")
        .optional()
        .messages({
        "string.base": "Payment status must be a string",
        "any.only": "Payment status must be one of: UNPAID, PARTIAL, PAID, WAIVED, OVERDUE",
    }),
    isPaid: joi_1.default.boolean().optional().messages({
        "boolean.base": "isPaid must be a boolean",
    }),
    isOverdue: joi_1.default.boolean().optional().messages({
        "boolean.base": "isOverdue must be a boolean",
    }),
    isWaived: joi_1.default.boolean().optional().messages({
        "boolean.base": "isWaived must be a boolean",
    }),
    dateFrom: joi_1.default.date().iso().optional().messages({
        "date.base": "Date from must be a valid date",
        "date.format": "Date from must be in ISO format",
    }),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional().messages({
        "date.base": "Date to must be a valid date",
        "date.format": "Date to must be in ISO format",
        "date.min": "Date to must be after date from",
    }),
    page: joi_1.default.number().integer().min(1).optional().default(1).messages({
        "number.base": "Page must be a number",
        "number.integer": "Page must be an integer",
        "number.min": "Page must be at least 1",
    }),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
        "number.base": "Limit must be a number",
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
    }),
    sortBy: joi_1.default.string()
        .valid("createdAt", "amount", "dueDate", "balance")
        .optional()
        .default("createdAt")
        .messages({
        "string.base": "Sort by must be a string",
        "any.only": "Sort by must be one of: createdAt, amount, dueDate, balance",
    }),
    sortOrder: joi_1.default.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
        .messages({
        "string.base": "Sort order must be a string",
        "any.only": "Sort order must be either asc or desc",
    }),
}).messages({
    "object.base": "Query parameters must be a valid object",
});
/**
 * Validation schema for generating penalty reports
 */
exports.penaltyReportSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    paymentStatus: joi_1.default.string()
        .valid("UNPAID", "PARTIAL", "PAID", "WAIVED", "OVERDUE")
        .optional()
        .messages({
        "string.base": "Payment status must be a string",
        "any.only": "Payment status must be one of: UNPAID, PARTIAL, PAID, WAIVED, OVERDUE",
    }),
    dateFrom: joi_1.default.date().iso().required().messages({
        "date.base": "Date from must be a valid date",
        "date.format": "Date from must be in ISO format",
        "any.required": "Date from is required",
    }),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).required().messages({
        "date.base": "Date to must be a valid date",
        "date.format": "Date to must be in ISO format",
        "date.min": "Date to must be after date from",
        "any.required": "Date to is required",
    }),
    includeStats: joi_1.default.boolean().optional().default(true).messages({
        "boolean.base": "includeStats must be a boolean",
    }),
    groupBy: joi_1.default.string()
        .valid("parent", "meeting", "status")
        .optional()
        .messages({
        "string.base": "Group by must be a string",
        "any.only": "Group by must be one of: parent, meeting, status",
    }),
}).messages({
    "object.base": "Query parameters must be a valid object",
});
/**
 * Validation schema for getting penalty statistics
 */
exports.penaltyStatsSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    dateFrom: joi_1.default.date().iso().optional().messages({
        "date.base": "Date from must be a valid date",
        "date.format": "Date from must be in ISO format",
    }),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional().messages({
        "date.base": "Date to must be a valid date",
        "date.format": "Date to must be in ISO format",
        "date.min": "Date to must be after date from",
    }),
}).messages({
    "object.base": "Query parameters must be a valid object",
});
/**
 * Validation schema for sending payment reminders
 */
exports.sendRemindersSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    overdueOnly: joi_1.default.boolean().optional().default(false).messages({
        "boolean.base": "overdueOnly must be a boolean",
    }),
    customMessage: joi_1.default.string().max(1000).optional().allow("").messages({
        "string.base": "Custom message must be a string",
        "string.max": "Custom message cannot exceed 1000 characters",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
//# sourceMappingURL=penalties.validation.js.map