"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectStatsSchema = exports.projectReportSchema = exports.updateProjectUpdateSchema = exports.createProjectUpdateSchema = exports.updateExpenseSchema = exports.recordExpenseSchema = exports.getProjectsSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Create project validation schema
exports.createProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(200).required(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
    budget: joi_1.default.number().positive().required(),
    fundingGoal: joi_1.default.number().positive().optional().allow(null),
    targetBeneficiaries: joi_1.default.number().integer().positive().optional().allow(null),
    priority: joi_1.default.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .default("MEDIUM"),
    startDate: joi_1.default.date().iso().required(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).optional().allow(null),
    location: joi_1.default.string().max(200).optional().allow(null, ""),
    venue: joi_1.default.string().max(200).optional().allow(null, ""),
    notes: joi_1.default.string().max(5000).optional().allow(null, ""),
});
// Update project validation schema
exports.updateProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(200).optional(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
    budget: joi_1.default.number().positive().optional(),
    fundingGoal: joi_1.default.number().positive().optional().allow(null),
    targetBeneficiaries: joi_1.default.number().integer().positive().optional().allow(null),
    status: joi_1.default.string()
        .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "planning", "active", "on_hold", "completed", "cancelled")
        .uppercase()
        .optional(),
    priority: joi_1.default.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional().allow(null),
    completedDate: joi_1.default.date().iso().optional().allow(null),
    progressPercentage: joi_1.default.number().min(0).max(100).optional(),
    location: joi_1.default.string().max(200).optional().allow(null, ""),
    venue: joi_1.default.string().max(200).optional().allow(null, ""),
    notes: joi_1.default.string().max(5000).optional().allow(null, ""),
}).min(1);
// Get projects with filters
exports.getProjectsSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "planning", "active", "on_hold", "completed", "cancelled")
        .uppercase()
        .optional(),
    priority: joi_1.default.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
    createdById: joi_1.default.number().integer().positive().optional(),
    dateFrom: joi_1.default.date().iso().optional(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional(),
    search: joi_1.default.string().max(100).optional(),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sortBy: joi_1.default.string()
        .valid("createdAt", "name", "budget", "startDate", "priority", "status")
        .default("createdAt"),
    sortOrder: joi_1.default.string().valid("asc", "desc").default("desc"),
});
// Record expense validation schema
exports.recordExpenseSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).required(),
    description: joi_1.default.string().max(2000).optional().allow(null, ""),
    amount: joi_1.default.number().positive().required(),
    category: joi_1.default.string().max(100).optional().allow(null, ""),
    expenseDate: joi_1.default.date().iso().optional(),
    receipt: joi_1.default.string().uri().max(500).optional().allow(null, ""),
    notes: joi_1.default.string().max(1000).optional().allow(null, ""),
});
// Update expense validation schema
exports.updateExpenseSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).optional(),
    description: joi_1.default.string().max(2000).optional().allow(null, ""),
    amount: joi_1.default.number().positive().optional(),
    category: joi_1.default.string().max(100).optional().allow(null, ""),
    expenseDate: joi_1.default.date().iso().optional(),
    receipt: joi_1.default.string().uri().max(500).optional().allow(null, ""),
    notes: joi_1.default.string().max(1000).optional().allow(null, ""),
}).min(1);
// Create project update validation schema
exports.createProjectUpdateSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).required(),
    content: joi_1.default.string().min(10).max(5000).required(),
    isPublic: joi_1.default.boolean().default(true),
    isMilestone: joi_1.default.boolean().default(false),
    attachments: joi_1.default.string().max(2000).optional().allow(null, ""),
});
// Update project update validation schema
exports.updateProjectUpdateSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).optional(),
    content: joi_1.default.string().min(10).max(5000).optional(),
    isPublic: joi_1.default.boolean().optional(),
    isMilestone: joi_1.default.boolean().optional(),
    attachments: joi_1.default.string().max(2000).optional().allow(null, ""),
}).min(1);
// Project report validation schema
exports.projectReportSchema = joi_1.default.object({
    projectId: joi_1.default.number().integer().positive().optional(),
    status: joi_1.default.string()
        .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "planning", "active", "on_hold", "completed", "cancelled")
        .uppercase()
        .optional(),
    priority: joi_1.default.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
    dateFrom: joi_1.default.date().iso().required(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).required(),
    includeStats: joi_1.default.boolean().default(true),
    includeExpenses: joi_1.default.boolean().default(true),
    includeContributions: joi_1.default.boolean().default(true),
});
// Project statistics validation schema
exports.projectStatsSchema = joi_1.default.object({
    projectId: joi_1.default.number().integer().positive().optional(),
    status: joi_1.default.string()
        .valid("PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "planning", "active", "on_hold", "completed", "cancelled")
        .uppercase()
        .optional(),
    dateFrom: joi_1.default.date().iso().optional(),
    dateTo: joi_1.default.date().iso().min(joi_1.default.ref("dateFrom")).optional(),
});
//# sourceMappingURL=projects.validation.js.map