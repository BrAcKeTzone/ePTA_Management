"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentBasisSchema = exports.verifyPaymentSchema = exports.sendRemindersSchema = exports.contributionStatsSchema = exports.contributionReportSchema = exports.getContributionsSchema = exports.waiveContributionSchema = exports.updateContributionSchema = exports.recordPaymentSchema = exports.createContributionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Create contribution validation schema
exports.createContributionSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().required(),
    projectId: joi_1.default.number().integer().positive().optional().allow(null),
    type: joi_1.default.string()
        .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
        .required(),
    title: joi_1.default.string().min(3).max(200).required(),
    description: joi_1.default.string().max(2000).optional().allow(null, ""),
    amount: joi_1.default.number().positive().required(),
    dueDate: joi_1.default.date().iso().optional().allow(null),
    academicYear: joi_1.default.string().max(50).optional().allow(null, ""),
    period: joi_1.default.string().max(50).optional().allow(null, ""),
    adjustmentAmount: joi_1.default.number().min(0).optional().allow(null),
    adjustmentReason: joi_1.default.string().max(1000).optional().allow(null, ""),
});
// Record payment validation schema
exports.recordPaymentSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required(),
    method: joi_1.default.string()
        .valid("CASH", "BANK_TRANSFER", "GCASH", "PAYMAYA", "CHECK", "OTHER")
        .required(),
    reference: joi_1.default.string().max(100).optional().allow(null, ""),
    notes: joi_1.default.string().max(1000).optional().allow(null, ""),
});
// Update contribution validation schema
exports.updateContributionSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).optional(),
    description: joi_1.default.string().max(2000).optional().allow(null, ""),
    amount: joi_1.default.number().positive().optional(),
    dueDate: joi_1.default.date().iso().optional().allow(null),
    academicYear: joi_1.default.string().max(50).optional().allow(null, ""),
    period: joi_1.default.string().max(50).optional().allow(null, ""),
    adjustmentAmount: joi_1.default.number().min(0).optional().allow(null),
    adjustmentReason: joi_1.default.string().max(1000).optional().allow(null, ""),
}).min(1); // At least one field must be provided
// Waive contribution validation schema
exports.waiveContributionSchema = joi_1.default.object({
    waiverReason: joi_1.default.string().min(10).max(1000).required(),
});
// Get contributions with filters
exports.getContributionsSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional(),
    projectId: joi_1.default.number().integer().positive().optional(),
    type: joi_1.default.string()
        .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
        .optional(),
    status: joi_1.default.string()
        .valid("PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED")
        .optional(),
    isPaid: joi_1.default.boolean().optional(),
    isOverdue: joi_1.default.boolean().optional(),
    isWaived: joi_1.default.boolean().optional(),
    academicYear: joi_1.default.string().max(50).optional(),
    period: joi_1.default.string().max(50).optional(),
    dateFrom: joi_1.default.date().iso().optional(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional(),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sortBy: joi_1.default.string()
        .valid("createdAt", "amount", "dueDate", "balance", "title")
        .default("createdAt"),
    sortOrder: joi_1.default.string().valid("asc", "desc").default("desc"),
});
// Contribution report validation schema
exports.contributionReportSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional(),
    projectId: joi_1.default.number().integer().positive().optional(),
    type: joi_1.default.string()
        .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
        .optional(),
    status: joi_1.default.string()
        .valid("PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED")
        .optional(),
    academicYear: joi_1.default.string().max(50).optional(),
    period: joi_1.default.string().max(50).optional(),
    dateFrom: joi_1.default.date().iso().required(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).required(),
    includeStats: joi_1.default.boolean().default(true),
    groupBy: joi_1.default.string().valid("parent", "project", "type", "status").optional(),
});
// Contribution statistics validation schema
exports.contributionStatsSchema = joi_1.default.object({
    parentId: joi_1.default.number().integer().positive().optional(),
    projectId: joi_1.default.number().integer().positive().optional(),
    type: joi_1.default.string()
        .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
        .optional(),
    academicYear: joi_1.default.string().max(50).optional(),
    period: joi_1.default.string().max(50).optional(),
    dateFrom: joi_1.default.date().iso().optional(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional(),
});
// Send reminders validation schema
exports.sendRemindersSchema = joi_1.default.object({
    daysBeforeDue: joi_1.default.number().integer().min(0).default(3),
    contributionIds: joi_1.default.array()
        .items(joi_1.default.number().integer().positive())
        .optional(),
});
// Verify payment validation schema
exports.verifyPaymentSchema = joi_1.default.object({
    verified: joi_1.default.boolean().required(),
    notes: joi_1.default.string().max(1000).optional().allow(null, ""),
});
// Update payment basis validation schema
exports.updatePaymentBasisSchema = joi_1.default.object({
    paymentBasis: joi_1.default.string()
        .valid("PER_STUDENT", "PER_FAMILY", "PER_MEETING")
        .required(),
    monthlyContributionAmount: joi_1.default.number().positive().optional(),
    projectContributionMinimum: joi_1.default.number().positive().optional(),
    enableMandatoryContribution: joi_1.default.boolean().optional(),
    allowPartialPayment: joi_1.default.boolean().optional(),
    paymentDueDays: joi_1.default.number().integer().min(1).max(365).optional(),
});
//# sourceMappingURL=contributions.validation.js.map