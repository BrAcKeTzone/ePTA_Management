"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsByCategorySchema = exports.updateSettingsSchema = exports.PAYMENT_BASIS = void 0;
const joi_1 = __importDefault(require("joi"));
// Payment basis enum values
exports.PAYMENT_BASIS = {
    PER_STUDENT: "PER_STUDENT",
    PER_FAMILY: "PER_FAMILY",
    PER_MEETING: "PER_MEETING",
};
// Validation schema for updating system settings
exports.updateSettingsSchema = joi_1.default.object({
    // Penalty Settings
    penaltyRatePerAbsence: joi_1.default.number()
        .min(0)
        .max(10000)
        .precision(2)
        .optional()
        .messages({
        "number.base": "Penalty rate per absence must be a number",
        "number.min": "Penalty rate per absence cannot be negative",
        "number.max": "Penalty rate per absence cannot exceed 10,000",
    }),
    penaltyRateLate: joi_1.default.number()
        .min(0)
        .max(10000)
        .precision(2)
        .optional()
        .messages({
        "number.base": "Penalty rate for late attendance must be a number",
        "number.min": "Penalty rate for late attendance cannot be negative",
        "number.max": "Penalty rate for late attendance cannot exceed 10,000",
    }),
    penaltyGracePeriodDays: joi_1.default.number()
        .integer()
        .min(0)
        .max(365)
        .optional()
        .messages({
        "number.base": "Penalty grace period must be a number",
        "number.integer": "Penalty grace period must be a whole number",
        "number.min": "Penalty grace period cannot be negative",
        "number.max": "Penalty grace period cannot exceed 365 days",
    }),
    enableAutoPenalty: joi_1.default.boolean().optional().messages({
        "boolean.base": "Enable auto penalty must be true or false",
    }),
    // Contribution Settings
    monthlyContributionAmount: joi_1.default.number()
        .min(0)
        .max(100000)
        .precision(2)
        .optional()
        .messages({
        "number.base": "Monthly contribution amount must be a number",
        "number.min": "Monthly contribution amount cannot be negative",
        "number.max": "Monthly contribution amount cannot exceed 100,000",
    }),
    projectContributionMinimum: joi_1.default.number()
        .min(0)
        .max(100000)
        .precision(2)
        .optional()
        .messages({
        "number.base": "Project contribution minimum must be a number",
        "number.min": "Project contribution minimum cannot be negative",
        "number.max": "Project contribution minimum cannot exceed 100,000",
    }),
    enableMandatoryContribution: joi_1.default.boolean().optional().messages({
        "boolean.base": "Enable mandatory contribution must be true or false",
    }),
    // Payment Settings
    paymentBasis: joi_1.default.string()
        .valid(...Object.values(exports.PAYMENT_BASIS))
        .optional()
        .messages({
        "string.base": "Payment basis must be a string",
        "any.only": "Payment basis must be one of: PER_STUDENT, PER_FAMILY, PER_MEETING",
    }),
    allowPartialPayment: joi_1.default.boolean().optional().messages({
        "boolean.base": "Allow partial payment must be true or false",
    }),
    paymentDueDays: joi_1.default.number().integer().min(1).max(365).optional().messages({
        "number.base": "Payment due days must be a number",
        "number.integer": "Payment due days must be a whole number",
        "number.min": "Payment due days must be at least 1",
        "number.max": "Payment due days cannot exceed 365",
    }),
    // Meeting Settings
    minimumMeetingsPerYear: joi_1.default.number()
        .integer()
        .min(1)
        .max(52)
        .optional()
        .messages({
        "number.base": "Minimum meetings per year must be a number",
        "number.integer": "Minimum meetings per year must be a whole number",
        "number.min": "Minimum meetings per year must be at least 1",
        "number.max": "Minimum meetings per year cannot exceed 52",
    }),
    quorumPercentage: joi_1.default.number()
        .min(0)
        .max(100)
        .precision(2)
        .optional()
        .messages({
        "number.base": "Quorum percentage must be a number",
        "number.min": "Quorum percentage cannot be negative",
        "number.max": "Quorum percentage cannot exceed 100",
    }),
    notificationDaysBeforeMeet: joi_1.default.number()
        .integer()
        .min(0)
        .max(90)
        .optional()
        .messages({
        "number.base": "Notification days before meeting must be a number",
        "number.integer": "Notification days before meeting must be a whole number",
        "number.min": "Notification days before meeting cannot be negative",
        "number.max": "Notification days before meeting cannot exceed 90",
    }),
    // Document Categories (JSON array of strings)
    documentCategories: joi_1.default.array()
        .items(joi_1.default.string().trim().min(1).max(100).messages({
        "string.base": "Each document category must be a string",
        "string.empty": "Document category cannot be empty",
        "string.min": "Document category must be at least 1 character",
        "string.max": "Document category cannot exceed 100 characters",
    }))
        .min(1)
        .max(50)
        .optional()
        .messages({
        "array.base": "Document categories must be an array",
        "array.min": "At least 1 document category is required",
        "array.max": "Cannot have more than 50 document categories",
    }),
    // Academic Year Settings
    currentAcademicYear: joi_1.default.string()
        .trim()
        .pattern(/^\d{4}-\d{4}$/)
        .optional()
        .messages({
        "string.base": "Current academic year must be a string",
        "string.pattern.base": "Current academic year must be in format YYYY-YYYY (e.g., 2024-2025)",
    }),
    academicYearStart: joi_1.default.string()
        .trim()
        .pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
        .optional()
        .messages({
        "string.base": "Academic year start must be a string",
        "string.pattern.base": "Academic year start must be in format MM-DD (e.g., 08-01)",
    }),
    academicYearEnd: joi_1.default.string()
        .trim()
        .pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
        .optional()
        .messages({
        "string.base": "Academic year end must be a string",
        "string.pattern.base": "Academic year end must be in format MM-DD (e.g., 07-31)",
    }),
    // System Settings
    systemName: joi_1.default.string().trim().min(3).max(200).optional().messages({
        "string.base": "System name must be a string",
        "string.empty": "System name cannot be empty",
        "string.min": "System name must be at least 3 characters",
        "string.max": "System name cannot exceed 200 characters",
    }),
    systemEmail: joi_1.default.string().trim().email().max(100).optional().messages({
        "string.base": "System email must be a string",
        "string.email": "System email must be a valid email address",
        "string.max": "System email cannot exceed 100 characters",
    }),
    systemPhone: joi_1.default.string()
        .trim()
        .pattern(/^[+]?[\d\s()-]+$/)
        .min(7)
        .max(20)
        .optional()
        .allow(null, "")
        .messages({
        "string.base": "System phone must be a string",
        "string.pattern.base": "System phone must be a valid phone number",
        "string.min": "System phone must be at least 7 characters",
        "string.max": "System phone cannot exceed 20 characters",
    }),
    enableEmailNotifications: joi_1.default.boolean().optional().messages({
        "boolean.base": "Enable email notifications must be true or false",
    }),
    enableSMSNotifications: joi_1.default.boolean().optional().messages({
        "boolean.base": "Enable SMS notifications must be true or false",
    }),
})
    .min(1)
    .messages({
    "object.min": "At least one setting field must be provided",
});
// Validation for getting settings by category
exports.getSettingsByCategorySchema = joi_1.default.object({
    category: joi_1.default.string()
        .valid("penalty", "contribution", "payment", "meeting", "document", "academic", "system", "notification", "all")
        .optional()
        .messages({
        "string.base": "Category must be a string",
        "any.only": "Category must be one of: penalty, contribution, payment, meeting, document, academic, system, notification, all",
    }),
});
//# sourceMappingURL=settings.validation.js.map