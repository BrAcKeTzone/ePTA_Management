"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkStudent = exports.requestLinkStudent = exports.getPaginated = exports.bulkUpdateStatus = exports.parentIdParam = exports.studentIdStringParam = exports.studentIdParam = exports.getStudents = exports.updateStudent = exports.createStudent = void 0;
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
// Common patterns for college
const studentIdPattern = /^[0-9]{4}-[0-9]{5}$/; // Format: 2024-12345
const yearEnrolledPattern = /^[0-9]{4}$/; // Format: 2024 (just the year)
exports.createStudent = joi_1.default.object().keys({
    studentId: joi_1.default.string().pattern(studentIdPattern).required().messages({
        "string.pattern.base": "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
    }),
    firstName: joi_1.default.string().min(2).max(50).required(),
    lastName: joi_1.default.string().min(2).max(50).required(),
    middleName: joi_1.default.string().min(2).max(50).optional().allow(""),
    birthDate: joi_1.default.date().optional().allow(""),
    yearEnrolled: joi_1.default.string().pattern(yearEnrolledPattern).required().messages({
        "string.pattern.base": "Year enrolled must follow format: YYYY (e.g., 2024)",
    }),
    parentId: joi_1.default.number().integer().positive().optional(),
});
exports.updateStudent = joi_1.default.object()
    .keys({
    firstName: joi_1.default.string().min(2).max(50).optional(),
    lastName: joi_1.default.string().min(2).max(50).optional(),
    middleName: joi_1.default.string().min(2).max(50).optional().allow(""),
    birthDate: joi_1.default.date().optional().allow(""),
    yearEnrolled: joi_1.default.string()
        .pattern(yearEnrolledPattern)
        .optional()
        .messages({
        "string.pattern.base": "Year enrolled must follow format: YYYY (e.g., 2024)",
    }),
    status: joi_1.default.string()
        .valid(...Object.values(client_1.StudentStatus))
        .optional(),
    linkStatus: joi_1.default.string()
        .valid(...Object.values(client_1.LinkStatus))
        .optional(),
})
    .unknown(true); // Allow unknown fields (like id, studentId, etc.) - they will be stripped
exports.getStudents = joi_1.default.object().keys({
    search: joi_1.default.string().max(100).optional(),
    yearEnrolled: joi_1.default.string().pattern(yearEnrolledPattern).optional(),
    status: joi_1.default.string()
        .valid(...Object.values(client_1.StudentStatus))
        .optional(),
    linkStatus: joi_1.default.string()
        .valid(...Object.values(client_1.LinkStatus))
        .optional(),
    parentId: joi_1.default.number().integer().positive().optional(),
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
exports.studentIdParam = joi_1.default.object().keys({
    id: joi_1.default.number().integer().positive().required(),
});
exports.studentIdStringParam = joi_1.default.object().keys({
    studentId: joi_1.default.string().pattern(studentIdPattern).required(),
});
exports.parentIdParam = joi_1.default.object().keys({
    parentId: joi_1.default.number().integer().positive().required(),
});
exports.bulkUpdateStatus = joi_1.default.object().keys({
    studentIds: joi_1.default.array()
        .items(joi_1.default.number().integer().positive())
        .min(1)
        .required(),
    status: joi_1.default.string()
        .valid(...Object.values(client_1.StudentStatus))
        .required(),
});
exports.getPaginated = joi_1.default.object().keys({
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
exports.requestLinkStudent = joi_1.default.object().keys({
    studentId: joi_1.default.string().pattern(studentIdPattern).required().messages({
        "string.pattern.base": "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
    }),
    relationship: joi_1.default.string().valid("PARENT", "GUARDIAN", "OTHER").optional(),
    // parentId comes from authenticated user, not from request body
});
exports.unlinkStudent = joi_1.default.object().keys({
    userId: joi_1.default.number().integer().positive().required(),
    userRole: joi_1.default.string().valid("ADMIN", "PARENT").required(),
});
//# sourceMappingURL=students.validation.js.map