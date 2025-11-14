import Joi from "joi";

// Create project validation schema
export const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(5000).optional().allow(null, ""),
  budget: Joi.number().positive().required(),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM"),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional().allow(null),
  venue: Joi.string().max(200).optional().allow(null, ""),
});

// Update project validation schema
export const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(5000).optional().allow(null, ""),
  budget: Joi.number().positive().optional(),
  status: Joi.string()
    .valid(
      "PLANNING",
      "ACTIVE",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled"
    )
    .uppercase()
    .optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().allow(null),
  completedDate: Joi.date().iso().optional().allow(null),
  venue: Joi.string().max(200).optional().allow(null, ""),
  cancellationReason: Joi.string().max(5000).optional().allow(null, ""),
  completionImages: Joi.string().max(10000).optional().allow(null, ""), // Array of Cloudinary URLs stored as JSON string
}).min(1);

// Get projects with filters
export const getProjectsSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PLANNING",
      "ACTIVE",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled"
    )
    .uppercase()
    .optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  createdById: Joi.number().integer().positive().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "name", "budget", "startDate", "priority", "status")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Record expense validation schema
export const recordExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional().allow(null, ""),
  amount: Joi.number().positive().required(),
  category: Joi.string().max(100).optional().allow(null, ""),
  expenseDate: Joi.date().iso().optional(),
  receipt: Joi.string().uri().max(500).optional().allow(null, ""),
  notes: Joi.string().max(1000).optional().allow(null, ""),
});

// Update expense validation schema
export const updateExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional().allow(null, ""),
  amount: Joi.number().positive().optional(),
  category: Joi.string().max(100).optional().allow(null, ""),
  expenseDate: Joi.date().iso().optional(),
  receipt: Joi.string().uri().max(500).optional().allow(null, ""),
  notes: Joi.string().max(1000).optional().allow(null, ""),
}).min(1);

// Create project update validation schema
export const createProjectUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).max(5000).required(),
  isPublic: Joi.boolean().default(true),
  isMilestone: Joi.boolean().default(false),
  attachments: Joi.string().max(2000).optional().allow(null, ""),
});

// Update project update validation schema
export const updateProjectUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(10).max(5000).optional(),
  isPublic: Joi.boolean().optional(),
  isMilestone: Joi.boolean().optional(),
  attachments: Joi.string().max(2000).optional().allow(null, ""),
}).min(1);

// Project report validation schema
export const projectReportSchema = Joi.object({
  projectId: Joi.number().integer().positive().optional(),
  status: Joi.string()
    .valid(
      "PLANNING",
      "ACTIVE",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled"
    )
    .uppercase()
    .optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  dateFrom: Joi.date().iso().required(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).required(),
  includeStats: Joi.boolean().default(true),
  includeExpenses: Joi.boolean().default(true),
  includeContributions: Joi.boolean().default(true),
});

// Project statistics validation schema
export const projectStatsSchema = Joi.object({
  projectId: Joi.number().integer().positive().optional(),
  status: Joi.string()
    .valid(
      "PLANNING",
      "ACTIVE",
      "ON_HOLD",
      "COMPLETED",
      "CANCELLED",
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled"
    )
    .uppercase()
    .optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
});
