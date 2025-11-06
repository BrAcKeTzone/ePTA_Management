"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFinancialReportCSV = exports.generateFinancialReportPDF = exports.generateFinancialReport = exports.verifyContributionPayment = exports.updatePaymentBasisSettings = exports.getDetailedPaymentBasisSettings = exports.getPaymentBasisSettings = exports.getUserBalance = exports.getContributionStats = exports.generateContributionReport = exports.updateOverdueStatus = exports.waiveContribution = exports.recordPayment = exports.deleteContribution = exports.updateContribution = exports.getContributionById = exports.getContributions = exports.createContribution = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
/**
 * Create a new contribution
 */
const createContribution = async (data) => {
    // Validate parent exists and has PARENT role
    const parent = await prisma_1.default.user.findUnique({
        where: { id: data.parentId },
    });
    if (!parent) {
        throw new ApiError_1.default(404, "Parent not found");
    }
    if (parent.role !== client_1.UserRole.PARENT) {
        throw new ApiError_1.default(400, "User must have PARENT role");
    }
    // If projectId provided, validate project exists
    if (data.projectId) {
        const project = await prisma_1.default.project.findUnique({
            where: { id: data.projectId },
        });
        if (!project) {
            throw new ApiError_1.default(404, "Project not found");
        }
    }
    // Calculate balance after adjustment
    const adjustmentAmount = data.adjustmentAmount || 0;
    const balance = data.amount - adjustmentAmount;
    if (balance < 0) {
        throw new ApiError_1.default(400, "Adjustment amount cannot exceed contribution amount");
    }
    // Set default due date if not provided (30 days from now)
    const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Check if already overdue
    const isOverdue = dueDate < new Date() && balance > 0;
    const contribution = await prisma_1.default.contribution.create({
        data: {
            parentId: data.parentId,
            projectId: data.projectId,
            type: data.type,
            title: data.title,
            description: data.description,
            amount: data.amount,
            balance,
            dueDate,
            academicYear: data.academicYear,
            period: data.period,
            adjustmentAmount,
            adjustmentReason: data.adjustmentReason,
            isOverdue,
            status: isOverdue
                ? client_1.ContributionStatus.OVERDUE
                : client_1.ContributionStatus.PENDING,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    phone: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    description: true,
                    budget: true,
                },
            },
        },
    });
    return contribution;
};
exports.createContribution = createContribution;
/**
 * Get contributions with filtering and pagination
 */
const getContributions = async (filters) => {
    const { parentId, projectId, type, status, isPaid, isOverdue, isWaived, academicYear, period, dateFrom, dateTo, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = filters;
    const where = {};
    if (parentId)
        where.parentId = parentId;
    if (projectId)
        where.projectId = projectId;
    if (type)
        where.type = type;
    if (status)
        where.status = status;
    if (typeof isPaid === "boolean")
        where.isPaid = isPaid;
    if (typeof isOverdue === "boolean")
        where.isOverdue = isOverdue;
    if (typeof isWaived === "boolean")
        where.isWaived = isWaived;
    if (academicYear)
        where.academicYear = academicYear;
    if (period)
        where.period = period;
    // Date range filter
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom)
            where.createdAt.gte = dateFrom;
        if (dateTo)
            where.createdAt.lte = dateTo;
    }
    const skip = (page - 1) * limit;
    const [contributions, total] = await Promise.all([
        prisma_1.default.contribution.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                parent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                        email: true,
                        phone: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                        description: true,
                        budget: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 5, // Last 5 payments
                },
            },
        }),
        prisma_1.default.contribution.count({ where }),
    ]);
    return {
        contributions,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getContributions = getContributions;
/**
 * Get contribution by ID
 */
const getContributionById = async (id) => {
    const contribution = await prisma_1.default.contribution.findUnique({
        where: { id },
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    phone: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    description: true,
                    budget: true,
                    startDate: true,
                    endDate: true,
                },
            },
            payments: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!contribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    return contribution;
};
exports.getContributionById = getContributionById;
/**
 * Update contribution
 */
const updateContribution = async (id, data) => {
    // Check if contribution exists
    const existingContribution = await prisma_1.default.contribution.findUnique({
        where: { id },
    });
    if (!existingContribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    // Cannot update paid or waived contributions
    if (existingContribution.isPaid) {
        throw new ApiError_1.default(400, "Cannot update a paid contribution");
    }
    if (existingContribution.isWaived) {
        throw new ApiError_1.default(400, "Cannot update a waived contribution");
    }
    // Recalculate balance if amount or adjustment changes
    let balance = existingContribution.balance;
    if (data.amount !== undefined || data.adjustmentAmount !== undefined) {
        const newAmount = data.amount ?? existingContribution.amount;
        const newAdjustment = data.adjustmentAmount ?? existingContribution.adjustmentAmount ?? 0;
        balance = newAmount - newAdjustment - existingContribution.amountPaid;
        if (balance < 0) {
            throw new ApiError_1.default(400, "New balance would be negative");
        }
    }
    // Check if overdue after update
    const dueDate = data.dueDate || existingContribution.dueDate;
    const isOverdue = dueDate ? dueDate < new Date() && balance > 0 : false;
    const contribution = await prisma_1.default.contribution.update({
        where: { id },
        data: {
            ...data,
            balance,
            isOverdue,
            status: isOverdue
                ? client_1.ContributionStatus.OVERDUE
                : existingContribution.status,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    phone: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    description: true,
                    budget: true,
                },
            },
        },
    });
    return contribution;
};
exports.updateContribution = updateContribution;
/**
 * Delete contribution
 */
const deleteContribution = async (id) => {
    // Check if contribution exists
    const contribution = await prisma_1.default.contribution.findUnique({
        where: { id },
        include: { payments: true },
    });
    if (!contribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    // Cannot delete if payments have been made
    if (contribution.payments.length > 0) {
        throw new ApiError_1.default(400, "Cannot delete contribution with payment history. Consider waiving it instead.");
    }
    await prisma_1.default.contribution.delete({ where: { id } });
    return { message: "Contribution deleted successfully" };
};
exports.deleteContribution = deleteContribution;
/**
 * Record a payment for a contribution
 */
const recordPayment = async (id, data) => {
    // Get contribution
    const contribution = await prisma_1.default.contribution.findUnique({
        where: { id },
        include: { payments: true },
    });
    if (!contribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    // Cannot record payment for paid contribution
    if (contribution.isPaid) {
        throw new ApiError_1.default(400, "Contribution is already fully paid");
    }
    // Cannot record payment for waived contribution
    if (contribution.isWaived) {
        throw new ApiError_1.default(400, "Cannot record payment for waived contribution");
    }
    // Validate payment amount
    if (data.amount > contribution.balance) {
        throw new ApiError_1.default(400, `Payment amount (${data.amount}) exceeds remaining balance (${contribution.balance})`);
    }
    // Calculate new values
    const newAmountPaid = contribution.amountPaid + data.amount;
    const newBalance = contribution.balance - data.amount;
    const isPaid = newBalance === 0;
    // Use transaction to ensure data consistency
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Create payment record
        const payment = await tx.contributionPayment.create({
            data: {
                contributionId: id,
                amount: data.amount,
                method: data.method,
                reference: data.reference,
                notes: data.notes,
                recordedBy: data.recordedBy,
            },
        });
        // Update contribution
        const updatedContribution = await tx.contribution.update({
            where: { id },
            data: {
                amountPaid: newAmountPaid,
                balance: newBalance,
                isPaid,
                paidAt: isPaid ? new Date() : null,
                paymentMethod: data.method,
                paymentReference: data.reference,
                paymentNotes: data.notes,
                status: isPaid ? client_1.ContributionStatus.PAID : client_1.ContributionStatus.PARTIAL,
                isOverdue: false, // Payment clears overdue status
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                        email: true,
                        phone: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        middleName: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        return { payment, contribution: updatedContribution };
    });
    return result;
};
exports.recordPayment = recordPayment;
/**
 * Waive a contribution
 */
const waiveContribution = async (id, waiverReason, waivedBy) => {
    // Check if contribution exists
    const contribution = await prisma_1.default.contribution.findUnique({
        where: { id },
    });
    if (!contribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    // Cannot waive already paid contribution
    if (contribution.isPaid) {
        throw new ApiError_1.default(400, "Cannot waive a fully paid contribution");
    }
    // Cannot waive already waived contribution
    if (contribution.isWaived) {
        throw new ApiError_1.default(400, "Contribution is already waived");
    }
    const waived = await prisma_1.default.contribution.update({
        where: { id },
        data: {
            isWaived: true,
            waivedAt: new Date(),
            waivedBy,
            waiverReason,
            balance: 0,
            status: client_1.ContributionStatus.WAIVED,
            isOverdue: false,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    phone: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                },
            },
        },
    });
    return waived;
};
exports.waiveContribution = waiveContribution;
/**
 * Update overdue status for contributions past their due date
 */
const updateOverdueStatus = async () => {
    const now = new Date();
    // Find all contributions that should be marked as overdue
    const overdueContributions = await prisma_1.default.contribution.findMany({
        where: {
            dueDate: { lt: now },
            isPaid: false,
            isWaived: false,
            isOverdue: false,
        },
    });
    // Update them in bulk
    const updates = overdueContributions.map((contribution) => {
        const daysOverdue = Math.floor((now.getTime() - contribution.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return prisma_1.default.contribution.update({
            where: { id: contribution.id },
            data: {
                isOverdue: true,
                daysOverdue,
                status: client_1.ContributionStatus.OVERDUE,
            },
        });
    });
    await Promise.all(updates);
    return {
        message: `${overdueContributions.length} contributions marked as overdue`,
        count: overdueContributions.length,
    };
};
exports.updateOverdueStatus = updateOverdueStatus;
/**
 * Generate contribution report
 */
const generateContributionReport = async (filters) => {
    const { parentId, projectId, type, status, academicYear, period, dateFrom, dateTo, includeStats = true, groupBy, } = filters;
    const where = {};
    if (parentId)
        where.parentId = parentId;
    if (projectId)
        where.projectId = projectId;
    if (type)
        where.type = type;
    if (status)
        where.status = status;
    if (academicYear)
        where.academicYear = academicYear;
    if (period)
        where.period = period;
    // Date range filter
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom)
            where.createdAt.gte = new Date(dateFrom);
        if (dateTo)
            where.createdAt.lte = new Date(dateTo);
    }
    const contributions = await prisma_1.default.contribution.findMany({
        where,
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                    phone: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    description: true,
                    budget: true,
                },
            },
            payments: true,
        },
        orderBy: { createdAt: "desc" },
    });
    const report = {
        dateRange: {
            from: dateFrom || "All time",
            to: dateTo || "Present",
        },
        totalRecords: contributions.length,
        contributions,
    };
    // Calculate statistics if requested
    if (includeStats) {
        const totalContributions = contributions.length;
        const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalPaid = contributions.filter((c) => c.isPaid).length;
        const totalPending = contributions.filter((c) => c.status === client_1.ContributionStatus.PENDING).length;
        const totalPartial = contributions.filter((c) => c.status === client_1.ContributionStatus.PARTIAL).length;
        const totalWaived = contributions.filter((c) => c.isWaived).length;
        const totalOverdue = contributions.filter((c) => c.isOverdue).length;
        const totalAmountPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
        const totalBalance = contributions.reduce((sum, c) => sum + c.balance, 0);
        report.statistics = {
            totalContributions,
            totalAmount,
            totalPaid,
            totalPending,
            totalPartial,
            totalWaived,
            totalOverdue,
            totalAmountPaid,
            totalBalance,
            collectionRate: totalContributions > 0
                ? ((totalAmountPaid / totalAmount) * 100).toFixed(2)
                : "0.00",
            statusBreakdown: {
                PENDING: totalPending,
                PARTIAL: totalPartial,
                PAID: totalPaid,
                WAIVED: totalWaived,
                OVERDUE: totalOverdue,
            },
        };
    }
    // Group data if requested
    if (groupBy) {
        const grouped = {};
        contributions.forEach((contribution) => {
            let key;
            if (groupBy === "parent") {
                key = `parent_${contribution.parentId}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        parent: contribution.parent,
                        contributions: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                grouped[key].contributions.push(contribution);
                grouped[key].totalAmount += contribution.amount;
                grouped[key].totalPaid += contribution.amountPaid;
                grouped[key].totalBalance += contribution.balance;
            }
            else if (groupBy === "project") {
                key = contribution.projectId
                    ? `project_${contribution.projectId}`
                    : "no_project";
                if (!grouped[key]) {
                    grouped[key] = {
                        project: contribution.project,
                        contributions: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                grouped[key].contributions.push(contribution);
                grouped[key].totalAmount += contribution.amount;
                grouped[key].totalPaid += contribution.amountPaid;
                grouped[key].totalBalance += contribution.balance;
            }
            else if (groupBy === "type") {
                key = contribution.type;
                if (!grouped[key]) {
                    grouped[key] = {
                        type: contribution.type,
                        contributions: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                grouped[key].contributions.push(contribution);
                grouped[key].totalAmount += contribution.amount;
                grouped[key].totalPaid += contribution.amountPaid;
                grouped[key].totalBalance += contribution.balance;
            }
            else if (groupBy === "status") {
                key = contribution.status;
                if (!grouped[key]) {
                    grouped[key] = {
                        status: contribution.status,
                        contributions: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                grouped[key].contributions.push(contribution);
                grouped[key].totalAmount += contribution.amount;
                grouped[key].totalPaid += contribution.amountPaid;
                grouped[key].totalBalance += contribution.balance;
            }
        });
        report.groupedData = Object.values(grouped);
    }
    return report;
};
exports.generateContributionReport = generateContributionReport;
/**
 * Get contribution statistics
 */
const getContributionStats = async (filters) => {
    const { parentId, projectId, type, academicYear, period, dateFrom, dateTo } = filters;
    const where = {};
    if (parentId)
        where.parentId = parentId;
    if (projectId)
        where.projectId = projectId;
    if (type)
        where.type = type;
    if (academicYear)
        where.academicYear = academicYear;
    if (period)
        where.period = period;
    // Date range filter
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom)
            where.createdAt.gte = new Date(dateFrom);
        if (dateTo)
            where.createdAt.lte = new Date(dateTo);
    }
    const contributions = await prisma_1.default.contribution.findMany({
        where,
        include: {
            payments: true,
        },
    });
    const totalContributions = contributions.length;
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalAmountPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalBalance = contributions.reduce((sum, c) => sum + c.balance, 0);
    const statusCounts = {
        paid: contributions.filter((c) => c.isPaid).length,
        pending: contributions.filter((c) => c.status === client_1.ContributionStatus.PENDING).length,
        partial: contributions.filter((c) => c.status === client_1.ContributionStatus.PARTIAL).length,
        waived: contributions.filter((c) => c.isWaived).length,
        overdue: contributions.filter((c) => c.isOverdue).length,
    };
    const typeCounts = {};
    contributions.forEach((c) => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    return {
        totalContributions,
        totalAmount,
        totalAmountPaid,
        totalBalance,
        collectionRate: totalContributions > 0
            ? ((totalAmountPaid / totalAmount) * 100).toFixed(2)
            : "0.00",
        statusCounts,
        statusBreakdown: {
            PENDING: {
                count: statusCounts.pending,
                percentage: totalContributions > 0
                    ? ((statusCounts.pending / totalContributions) * 100).toFixed(2)
                    : "0.00",
            },
            PARTIAL: {
                count: statusCounts.partial,
                percentage: totalContributions > 0
                    ? ((statusCounts.partial / totalContributions) * 100).toFixed(2)
                    : "0.00",
            },
            PAID: {
                count: statusCounts.paid,
                percentage: totalContributions > 0
                    ? ((statusCounts.paid / totalContributions) * 100).toFixed(2)
                    : "0.00",
            },
            WAIVED: {
                count: statusCounts.waived,
                percentage: totalContributions > 0
                    ? ((statusCounts.waived / totalContributions) * 100).toFixed(2)
                    : "0.00",
            },
            OVERDUE: {
                count: statusCounts.overdue,
                percentage: totalContributions > 0
                    ? ((statusCounts.overdue / totalContributions) * 100).toFixed(2)
                    : "0.00",
            },
        },
        typeBreakdown: typeCounts,
        averages: {
            contributionAmount: totalContributions > 0
                ? (totalAmount / totalContributions).toFixed(2)
                : "0.00",
            paymentAmount: totalContributions > 0
                ? (totalAmountPaid / totalContributions).toFixed(2)
                : "0.00",
        },
    };
};
exports.getContributionStats = getContributionStats;
/**
 * Get user balance summary
 */
const getUserBalance = async (userId) => {
    const [contributions, payments] = await Promise.all([
        prisma_1.default.contribution.findMany({
            where: { parentId: userId },
            select: {
                amount: true,
                amountPaid: true,
                balance: true,
                status: true,
                isOverdue: true,
            },
        }),
        prisma_1.default.contributionPayment.findMany({
            where: {
                contribution: {
                    parentId: userId,
                },
            },
            select: {
                amount: true,
                createdAt: true,
            },
        }),
    ]);
    const totalOwed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalBalance = contributions.reduce((sum, c) => sum + c.balance, 0);
    const statusCounts = contributions.reduce((counts, c) => {
        counts[c.status] = (counts[c.status] || 0) + 1;
        if (c.isOverdue)
            counts.overdue++;
        return counts;
    }, {});
    return {
        summary: {
            totalOwed,
            totalPaid,
            totalBalance,
            contributionCount: contributions.length,
        },
        status: {
            pending: statusCounts.PENDING || 0,
            partial: statusCounts.PARTIAL || 0,
            paid: statusCounts.PAID || 0,
            overdue: statusCounts.overdue || 0,
            waived: statusCounts.WAIVED || 0,
        },
        recentPayments: payments
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5),
    };
};
exports.getUserBalance = getUserBalance;
/**
 * Get payment basis settings
 */
const getPaymentBasisSettings = async () => {
    const settings = await prisma_1.default.settings.findFirst({
        where: { key: "system_config" },
        select: {
            paymentBasis: true,
            monthlyContributionAmount: true,
            projectContributionMinimum: true,
            enableMandatoryContribution: true,
            allowPartialPayment: true,
            paymentDueDays: true,
        },
    });
    return (settings || {
        paymentBasis: "PER_STUDENT",
        monthlyContributionAmount: 100.0,
        projectContributionMinimum: 50.0,
        enableMandatoryContribution: true,
        allowPartialPayment: true,
        paymentDueDays: 30,
    });
};
exports.getPaymentBasisSettings = getPaymentBasisSettings;
/**
 * Get detailed payment basis settings
 */
const getDetailedPaymentBasisSettings = async () => {
    const settings = await prisma_1.default.settings.findFirst({
        where: { key: "system_config" },
    });
    return settings || {};
};
exports.getDetailedPaymentBasisSettings = getDetailedPaymentBasisSettings;
/**
 * Update payment basis settings
 */
const updatePaymentBasisSettings = async (updateData) => {
    const settings = await prisma_1.default.settings.upsert({
        where: { key: "system_config" },
        update: {
            ...updateData,
            updatedAt: new Date(),
        },
        create: {
            key: "system_config",
            ...updateData,
            updatedById: 1, // Default admin user
        },
    });
    return settings;
};
exports.updatePaymentBasisSettings = updatePaymentBasisSettings;
/**
 * Verify contribution payment
 */
const verifyContributionPayment = async (contributionId, verified, notes) => {
    const contribution = await prisma_1.default.contribution.findUnique({
        where: { id: contributionId },
    });
    if (!contribution) {
        throw new ApiError_1.default(404, "Contribution not found");
    }
    // Update verification status (this would be a custom field if needed)
    const updatedContribution = await prisma_1.default.contribution.update({
        where: { id: contributionId },
        data: {
            // For now, we'll use the existing fields
            paymentNotes: notes,
            updatedAt: new Date(),
        },
        include: {
            parent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    email: true,
                },
            },
            project: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                },
            },
            payments: true,
        },
    });
    return updatedContribution;
};
exports.verifyContributionPayment = verifyContributionPayment;
/**
 * Generate financial report
 */
const generateFinancialReport = async (filters) => {
    const contributions = await (0, exports.getContributions)(filters);
    const stats = await (0, exports.getContributionStats)(filters);
    return {
        contributions,
        statistics: stats,
        generatedAt: new Date(),
        filters,
    };
};
exports.generateFinancialReport = generateFinancialReport;
/**
 * Generate financial report PDF (placeholder)
 */
const generateFinancialReportPDF = async (filters) => {
    // This is a placeholder implementation
    // In a real application, you would use a PDF generation library like puppeteer or jsPDF
    const report = await (0, exports.generateFinancialReport)(filters);
    // Return a simple text representation for now
    const reportText = `Financial Report\nGenerated: ${new Date()}\nTotal Contributions: ${report.contributions.contributions.length}`;
    return Buffer.from(reportText, "utf-8");
};
exports.generateFinancialReportPDF = generateFinancialReportPDF;
/**
 * Generate financial report CSV
 */
const generateFinancialReportCSV = async (filters) => {
    const { contributions } = await (0, exports.getContributions)(filters);
    const headers = [
        "ID",
        "Parent",
        "Project",
        "Type",
        "Title",
        "Amount",
        "Amount Paid",
        "Balance",
        "Status",
        "Due Date",
        "Created At",
    ];
    const rows = contributions.map((c) => [
        c.id,
        c.parent?.name || "",
        c.project?.name || "",
        c.type,
        c.title,
        c.amount,
        c.amountPaid,
        c.balance,
        c.status,
        c.dueDate || "",
        c.createdAt,
    ]);
    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");
    return csvContent;
};
exports.generateFinancialReportCSV = generateFinancialReportCSV;
//# sourceMappingURL=contributions.service.js.map