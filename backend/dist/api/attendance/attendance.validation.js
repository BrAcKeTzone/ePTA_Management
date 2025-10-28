"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceStatsSchema = exports.calculatePenaltiesSchema = exports.attendanceReportSchema = exports.getAttendanceSchema = exports.updateAttendanceSchema = exports.bulkRecordAttendanceSchema = exports.recordAttendanceSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for recording single attendance
 */
exports.recordAttendanceSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
        "any.required": "Meeting ID is required",
    }),
    parentId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
        "any.required": "Parent ID is required",
    }),
    status: joi_1.default.string()
        .valid("PRESENT", "ABSENT", "EXCUSED")
        .required()
        .messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: PRESENT, ABSENT, EXCUSED",
        "any.required": "Status is required",
    }),
    checkInTime: joi_1.default.date().iso().optional().messages({
        "date.base": "Check-in time must be a valid date",
        "date.format": "Check-in time must be in ISO format",
    }),
    checkOutTime: joi_1.default.date().iso().optional().messages({
        "date.base": "Check-out time must be a valid date",
        "date.format": "Check-out time must be in ISO format",
    }),
    isLate: joi_1.default.boolean().optional().messages({
        "boolean.base": "isLate must be a boolean",
    }),
    lateMinutes: joi_1.default.number().integer().min(0).optional().messages({
        "number.base": "Late minutes must be a number",
        "number.integer": "Late minutes must be an integer",
        "number.min": "Late minutes cannot be negative",
    }),
    remarks: joi_1.default.string().max(1000).optional().allow("").messages({
        "string.base": "Remarks must be a string",
        "string.max": "Remarks cannot exceed 1000 characters",
    }),
    excuseReason: joi_1.default.string().max(1000).optional().allow("").messages({
        "string.base": "Excuse reason must be a string",
        "string.max": "Excuse reason cannot exceed 1000 characters",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
/**
 * Validation schema for bulk attendance recording
 */
exports.bulkRecordAttendanceSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
        "any.required": "Meeting ID is required",
    }),
    attendances: joi_1.default.array()
        .items(joi_1.default.object({
        parentId: joi_1.default.number().integer().positive().required().messages({
            "number.base": "Parent ID must be a number",
            "number.integer": "Parent ID must be an integer",
            "number.positive": "Parent ID must be positive",
            "any.required": "Parent ID is required",
        }),
        status: joi_1.default.string()
            .valid("PRESENT", "ABSENT", "EXCUSED")
            .required()
            .messages({
            "string.base": "Status must be a string",
            "any.only": "Status must be one of: PRESENT, ABSENT, EXCUSED",
            "any.required": "Status is required",
        }),
        checkInTime: joi_1.default.date().iso().optional().messages({
            "date.base": "Check-in time must be a valid date",
            "date.format": "Check-in time must be in ISO format",
        }),
        checkOutTime: joi_1.default.date().iso().optional().messages({
            "date.base": "Check-out time must be a valid date",
            "date.format": "Check-out time must be in ISO format",
        }),
        isLate: joi_1.default.boolean().optional().messages({
            "boolean.base": "isLate must be a boolean",
        }),
        lateMinutes: joi_1.default.number().integer().min(0).optional().messages({
            "number.base": "Late minutes must be a number",
            "number.integer": "Late minutes must be an integer",
            "number.min": "Late minutes cannot be negative",
        }),
        remarks: joi_1.default.string().max(1000).optional().allow("").messages({
            "string.base": "Remarks must be a string",
            "string.max": "Remarks cannot exceed 1000 characters",
        }),
        excuseReason: joi_1.default.string().max(1000).optional().allow("").messages({
            "string.base": "Excuse reason must be a string",
            "string.max": "Excuse reason cannot exceed 1000 characters",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "array.base": "Attendances must be an array",
        "array.min": "At least one attendance record is required",
        "any.required": "Attendances array is required",
    }),
}).messages({
    "object.base": "Request body must be a valid object",
});
/**
 * Validation schema for updating attendance
 */
exports.updateAttendanceSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("PRESENT", "ABSENT", "EXCUSED")
        .optional()
        .messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: PRESENT, ABSENT, EXCUSED",
    }),
    checkInTime: joi_1.default.date().iso().optional().allow(null).messages({
        "date.base": "Check-in time must be a valid date",
        "date.format": "Check-in time must be in ISO format",
    }),
    checkOutTime: joi_1.default.date().iso().optional().allow(null).messages({
        "date.base": "Check-out time must be a valid date",
        "date.format": "Check-out time must be in ISO format",
    }),
    isLate: joi_1.default.boolean().optional().messages({
        "boolean.base": "isLate must be a boolean",
    }),
    lateMinutes: joi_1.default.number().integer().min(0).optional().messages({
        "number.base": "Late minutes must be a number",
        "number.integer": "Late minutes must be an integer",
        "number.min": "Late minutes cannot be negative",
    }),
    remarks: joi_1.default.string().max(1000).optional().allow("", null).messages({
        "string.base": "Remarks must be a string",
        "string.max": "Remarks cannot exceed 1000 characters",
    }),
    excuseReason: joi_1.default.string().max(1000).optional().allow("", null).messages({
        "string.base": "Excuse reason must be a string",
        "string.max": "Excuse reason cannot exceed 1000 characters",
    }),
})
    .min(1)
    .messages({
    "object.base": "Request body must be a valid object",
    "object.min": "At least one field must be provided for update",
});
/**
 * Validation schema for getting attendance records with filters
 */
exports.getAttendanceSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    status: joi_1.default.string()
        .valid("PRESENT", "ABSENT", "EXCUSED")
        .optional()
        .messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: PRESENT, ABSENT, EXCUSED",
    }),
    hasPenalty: joi_1.default.boolean().optional().messages({
        "boolean.base": "hasPenalty must be a boolean",
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
        .valid("createdAt", "checkInTime", "status")
        .optional()
        .default("createdAt")
        .messages({
        "string.base": "Sort by must be a string",
        "any.only": "Sort by must be one of: createdAt, checkInTime, status",
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
 * Validation schema for generating attendance reports
 */
exports.attendanceReportSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
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
        .valid("meeting", "parent", "status")
        .optional()
        .messages({
        "string.base": "Group by must be a string",
        "any.only": "Group by must be one of: meeting, parent, status",
    }),
}).messages({
    "object.base": "Query parameters must be a valid object",
});
/**
 * Validation schema for calculating penalties
 */
exports.calculatePenaltiesSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
    }),
    applyPenalties: joi_1.default.boolean().optional().default(false).messages({
        "boolean.base": "applyPenalties must be a boolean",
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
 * Validation schema for getting attendance statistics
 */
exports.attendanceStatsSchema = joi_1.default.object({
    meetingId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Meeting ID must be a number",
        "number.integer": "Meeting ID must be an integer",
        "number.positive": "Meeting ID must be positive",
    }),
    parentId: joi_1.default.number().integer().positive().optional().messages({
        "number.base": "Parent ID must be a number",
        "number.integer": "Parent ID must be an integer",
        "number.positive": "Parent ID must be positive",
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
//# sourceMappingURL=attendance.validation.js.map