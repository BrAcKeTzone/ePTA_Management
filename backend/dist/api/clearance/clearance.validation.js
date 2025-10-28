"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkVerifySchema = exports.clearanceIdParam = exports.clearanceStatsSchema = exports.rejectClearanceSchema = exports.clearanceRequestParamsSchema = exports.requestClearanceSchema = exports.clearanceDetailsSchema = exports.verifyClearanceSchema = exports.searchParentStudentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.searchParentStudentSchema = joi_1.default.object().keys({
    q: joi_1.default.string().min(1).max(100).required().messages({
        "string.empty": "Search query is required",
        "string.min": "Search query must be at least 1 character",
        "string.max": "Search query cannot exceed 100 characters",
    }),
});
exports.verifyClearanceSchema = joi_1.default.object().keys({
    parentId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Parent ID must be a number",
        "number.positive": "Parent ID must be positive",
        "any.required": "Parent ID is required",
    }),
    studentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Student ID must be a number",
        "number.positive": "Student ID must be positive",
    }),
});
exports.clearanceDetailsSchema = joi_1.default.object().keys({
    parentId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Parent ID must be a number",
        "number.positive": "Parent ID must be positive",
        "any.required": "Parent ID is required",
    }),
    studentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Student ID must be a number",
        "number.positive": "Student ID must be positive",
    }),
});
exports.requestClearanceSchema = joi_1.default.object().keys({
    purpose: joi_1.default.string().min(5).max(500).required().messages({
        "string.empty": "Purpose is required",
        "string.min": "Purpose must be at least 5 characters",
        "string.max": "Purpose cannot exceed 500 characters",
    }),
    studentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Student ID must be a number",
        "number.positive": "Student ID must be positive",
    }),
});
exports.clearanceRequestParamsSchema = joi_1.default.object().keys({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    status: joi_1.default.string()
        .valid("PENDING", "APPROVED", "REJECTED", "pending", "approved", "rejected")
        .uppercase()
        .optional(),
    sortBy: joi_1.default.string()
        .valid("createdAt", "updatedAt", "purpose")
        .optional()
        .default("createdAt"),
    sortOrder: joi_1.default.string().valid("asc", "desc").optional().default("desc"),
});
exports.rejectClearanceSchema = joi_1.default.object().keys({
    reason: joi_1.default.string().max(500).optional().allow("").messages({
        "string.max": "Rejection reason cannot exceed 500 characters",
    }),
});
exports.clearanceStatsSchema = joi_1.default.object().keys({
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
    parentId: joi_1.default.number().integer().positive().optional(),
});
exports.clearanceIdParam = joi_1.default.object().keys({
    id: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Clearance request ID must be a number",
        "number.positive": "Clearance request ID must be positive",
        "any.required": "Clearance request ID is required",
    }),
});
exports.bulkVerifySchema = joi_1.default.object().keys({
    parentIds: joi_1.default.array()
        .items(joi_1.default.number().integer().positive().required())
        .min(1)
        .max(50)
        .required()
        .messages({
        "array.min": "At least one parent ID is required",
        "array.max": "Cannot verify more than 50 parents at once",
        "any.required": "Parent IDs array is required",
    }),
});
//# sourceMappingURL=clearance.validation.js.map