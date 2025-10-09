import Joi from "joi";

// Create contribution validation schema
export const createContributionSchema = Joi.object({
  parentId: Joi.number().integer().positive().required(),
  projectId: Joi.number().integer().positive().optional().allow(null),
  type: Joi.string()
    .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
    .required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional().allow(null, ""),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().iso().optional().allow(null),
  academicYear: Joi.string().max(50).optional().allow(null, ""),
  period: Joi.string().max(50).optional().allow(null, ""),
  adjustmentAmount: Joi.number().min(0).optional().allow(null),
  adjustmentReason: Joi.string().max(1000).optional().allow(null, ""),
});

// Record payment validation schema
export const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string()
    .valid("CASH", "BANK_TRANSFER", "GCASH", "PAYMAYA", "CHECK", "OTHER")
    .required(),
  reference: Joi.string().max(100).optional().allow(null, ""),
  notes: Joi.string().max(1000).optional().allow(null, ""),
});

// Update contribution validation schema
export const updateContributionSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional().allow(null, ""),
  amount: Joi.number().positive().optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  academicYear: Joi.string().max(50).optional().allow(null, ""),
  period: Joi.string().max(50).optional().allow(null, ""),
  adjustmentAmount: Joi.number().min(0).optional().allow(null),
  adjustmentReason: Joi.string().max(1000).optional().allow(null, ""),
}).min(1); // At least one field must be provided

// Waive contribution validation schema
export const waiveContributionSchema = Joi.object({
  waiverReason: Joi.string().min(10).max(1000).required(),
});

// Get contributions with filters
export const getContributionsSchema = Joi.object({
  parentId: Joi.number().integer().positive().optional(),
  projectId: Joi.number().integer().positive().optional(),
  type: Joi.string()
    .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
    .optional(),
  status: Joi.string()
    .valid("PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED")
    .optional(),
  isPaid: Joi.boolean().optional(),
  isOverdue: Joi.boolean().optional(),
  isWaived: Joi.boolean().optional(),
  academicYear: Joi.string().max(50).optional(),
  period: Joi.string().max(50).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "amount", "dueDate", "balance", "title")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Contribution report validation schema
export const contributionReportSchema = Joi.object({
  parentId: Joi.number().integer().positive().optional(),
  projectId: Joi.number().integer().positive().optional(),
  type: Joi.string()
    .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
    .optional(),
  status: Joi.string()
    .valid("PENDING", "PARTIAL", "PAID", "OVERDUE", "WAIVED")
    .optional(),
  academicYear: Joi.string().max(50).optional(),
  period: Joi.string().max(50).optional(),
  dateFrom: Joi.date().iso().required(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).required(),
  includeStats: Joi.boolean().default(true),
  groupBy: Joi.string().valid("parent", "project", "type", "status").optional(),
});

// Contribution statistics validation schema
export const contributionStatsSchema = Joi.object({
  parentId: Joi.number().integer().positive().optional(),
  projectId: Joi.number().integer().positive().optional(),
  type: Joi.string()
    .valid("MONTHLY", "PROJECT", "SPECIAL", "DONATION", "MEMBERSHIP", "EVENT")
    .optional(),
  academicYear: Joi.string().max(50).optional(),
  period: Joi.string().max(50).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref("dateFrom")).optional(),
});

// Send reminders validation schema
export const sendRemindersSchema = Joi.object({
  daysBeforeDue: Joi.number().integer().min(0).default(3),
  contributionIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),
});

// Verify payment validation schema
export const verifyPaymentSchema = Joi.object({
  verified: Joi.boolean().required(),
  notes: Joi.string().max(1000).optional().allow(null, ""),
});

// Update payment basis validation schema
export const updatePaymentBasisSchema = Joi.object({
  paymentBasis: Joi.string()
    .valid("PER_STUDENT", "PER_FAMILY", "PER_MEETING")
    .required(),
  monthlyContributionAmount: Joi.number().positive().optional(),
  projectContributionMinimum: Joi.number().positive().optional(),
  enableMandatoryContribution: Joi.boolean().optional(),
  allowPartialPayment: Joi.boolean().optional(),
  paymentDueDays: Joi.number().integer().min(1).max(365).optional(),
});
