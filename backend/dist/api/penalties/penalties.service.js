"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPenaltyStats = exports.generatePenaltyReport = exports.updateOverdueStatus = exports.waivePenalty = exports.recordPayment = exports.deletePenalty = exports.updatePenalty = exports.getPenaltyById = exports.getPenalties = exports.createPenalty = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma = new client_1.PrismaClient();
/**
 * Create a new penalty
 */
const createPenalty = async (data) => {
    // Verify parent exists and has PARENT role
    const parent = await prisma.user.findUnique({
        where: { id: data.parentId },
    });
    if (!parent) {
        throw new ApiError_1.default(404, "Parent not found");
    }
    if (parent.role !== "PARENT") {
        throw new ApiError_1.default(400, "User is not a parent");
    }
    // Verify meeting exists if provided
    if (data.meetingId) {
        const meeting = await prisma.meeting.findUnique({
            where: { id: data.meetingId },
        });
        if (!meeting) {
            throw new ApiError_1.default(404, "Meeting not found");
        }
    }
    // Calculate balance after discount
    const discountAmount = data.discountAmount || 0;
    const balance = data.amount - discountAmount;
    if (balance < 0) {
        throw new ApiError_1.default(400, "Discount amount cannot exceed penalty amount");
    }
    // Calculate due date if not provided (default: 30 days from now)
    const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Check if already overdue
    const isOverdue = new Date() > dueDate;
    const daysOverdue = isOverdue
        ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    // Create penalty
    const penalty = await prisma.penalty.create({
        data: {
            parentId: data.parentId,
            meetingId: data.meetingId,
            amount: data.amount,
            reason: data.reason,
            balance,
            dueDate,
            discountAmount,
            discountReason: data.discountReason,
            isOverdue,
            daysOverdue,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    meetingType: true,
                },
            },
        },
    });
    return penalty;
};
exports.createPenalty = createPenalty;
/**
 * Get penalties with filters and pagination
 */
const getPenalties = async (filters) => {
    const { parentId, meetingId, paymentStatus, isPaid, isOverdue, isWaived, dateFrom, dateTo, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = filters;
    // Build where clause
    const where = {};
    if (parentId) {
        where.parentId = parentId;
    }
    if (meetingId) {
        where.meetingId = meetingId;
    }
    if (paymentStatus) {
        where.paymentStatus = paymentStatus;
    }
    if (isPaid !== undefined) {
        where.isPaid = isPaid;
    }
    if (isOverdue !== undefined) {
        where.isOverdue = isOverdue;
    }
    if (isWaived !== undefined) {
        where.isWaived = isWaived;
    }
    if (dateFrom || dateTo) {
        const dateFilter = {};
        if (dateFrom) {
            dateFilter.gte = dateFrom;
        }
        if (dateTo) {
            dateFilter.lte = dateTo;
        }
        where.createdAt = dateFilter;
    }
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Get total count
    const total = await prisma.penalty.count({ where });
    // Get penalties
    const penalties = await prisma.penalty.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    meetingType: true,
                    venue: true,
                },
            },
            payments: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    return {
        penalties,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getPenalties = getPenalties;
/**
 * Get penalty by ID
 */
const getPenaltyById = async (id) => {
    const penalty = await prisma.penalty.findUnique({
        where: { id },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    date: true,
                    startTime: true,
                    venue: true,
                    meetingType: true,
                },
            },
            payments: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!penalty) {
        throw new ApiError_1.default(404, "Penalty not found");
    }
    return penalty;
};
exports.getPenaltyById = getPenaltyById;
/**
 * Update penalty
 */
const updatePenalty = async (id, data) => {
    // Check if penalty exists
    const existingPenalty = await prisma.penalty.findUnique({
        where: { id },
    });
    if (!existingPenalty) {
        throw new ApiError_1.default(404, "Penalty not found");
    }
    // Cannot update paid or waived penalties
    if (existingPenalty.isPaid) {
        throw new ApiError_1.default(400, "Cannot update a paid penalty");
    }
    if (existingPenalty.isWaived) {
        throw new ApiError_1.default(400, "Cannot update a waived penalty");
    }
    // Recalculate balance if amount or discount changes
    let balance = existingPenalty.balance;
    const newAmount = data.amount ?? existingPenalty.amount;
    const newDiscount = data.discountAmount ?? existingPenalty.discountAmount ?? 0;
    balance = newAmount - newDiscount - existingPenalty.amountPaid;
    if (balance < 0) {
        throw new ApiError_1.default(400, "New balance would be negative");
    }
    // Check if overdue status changed
    const dueDate = data.dueDate ?? existingPenalty.dueDate;
    const isOverdue = dueDate ? new Date() > dueDate : false;
    const daysOverdue = isOverdue && dueDate
        ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    // Update payment status
    let paymentStatus = existingPenalty.paymentStatus;
    if (isOverdue && paymentStatus === "UNPAID") {
        paymentStatus = "OVERDUE";
    }
    // Update penalty
    const penalty = await prisma.penalty.update({
        where: { id },
        data: {
            ...data,
            balance,
            isOverdue,
            daysOverdue,
            paymentStatus,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                },
            },
        },
    });
    return penalty;
};
exports.updatePenalty = updatePenalty;
/**
 * Delete penalty
 */
const deletePenalty = async (id) => {
    // Check if penalty exists
    const penalty = await prisma.penalty.findUnique({
        where: { id },
        include: {
            payments: true,
        },
    });
    if (!penalty) {
        throw new ApiError_1.default(404, "Penalty not found");
    }
    // Cannot delete if payments have been made
    if (penalty.payments.length > 0) {
        throw new ApiError_1.default(400, "Cannot delete penalty with payment history. Consider waiving instead.");
    }
    await prisma.penalty.delete({
        where: { id },
    });
    return { message: "Penalty deleted successfully" };
};
exports.deletePenalty = deletePenalty;
/**
 * Record a payment for a penalty
 */
const recordPayment = async (penaltyId, paymentData, recordedBy) => {
    // Get penalty
    const penalty = await prisma.penalty.findUnique({
        where: { id: penaltyId },
    });
    if (!penalty) {
        throw new ApiError_1.default(404, "Penalty not found");
    }
    // Check if already paid
    if (penalty.isPaid) {
        throw new ApiError_1.default(400, "Penalty is already fully paid");
    }
    // Check if waived
    if (penalty.isWaived) {
        throw new ApiError_1.default(400, "Cannot record payment for a waived penalty");
    }
    // Validate payment amount
    if (paymentData.amount > penalty.balance) {
        throw new ApiError_1.default(400, `Payment amount exceeds remaining balance of ₱${penalty.balance}`);
    }
    // Calculate new amounts
    const newAmountPaid = penalty.amountPaid + paymentData.amount;
    const newBalance = penalty.balance - paymentData.amount;
    const isPaid = newBalance === 0;
    const paymentStatus = isPaid
        ? "PAID"
        : newBalance < penalty.amount
            ? "PARTIAL"
            : "UNPAID";
    // Record payment in transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create payment record
        const payment = await tx.penaltyPayment.create({
            data: {
                penaltyId,
                amount: paymentData.amount,
                method: paymentData.method,
                reference: paymentData.reference,
                notes: paymentData.notes,
                recordedBy,
            },
        });
        // Update penalty
        const updatedPenalty = await tx.penalty.update({
            where: { id: penaltyId },
            data: {
                amountPaid: newAmountPaid,
                balance: newBalance,
                isPaid,
                paymentStatus,
                paidAt: isPaid ? new Date() : penalty.paidAt,
                paymentMethod: paymentData.method,
                paymentReference: paymentData.reference,
                paymentNotes: paymentData.notes,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                meeting: {
                    select: {
                        id: true,
                        title: true,
                        date: true,
                    },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        return { payment, penalty: updatedPenalty };
    });
    return result;
};
exports.recordPayment = recordPayment;
/**
 * Waive a penalty
 */
const waivePenalty = async (id, waiverReason, waivedBy) => {
    // Get penalty
    const penalty = await prisma.penalty.findUnique({
        where: { id },
    });
    if (!penalty) {
        throw new ApiError_1.default(404, "Penalty not found");
    }
    // Check if already paid
    if (penalty.isPaid) {
        throw new ApiError_1.default(400, "Cannot waive a paid penalty");
    }
    // Check if already waived
    if (penalty.isWaived) {
        throw new ApiError_1.default(400, "Penalty is already waived");
    }
    // Waive penalty
    const waivedPenalty = await prisma.penalty.update({
        where: { id },
        data: {
            isWaived: true,
            waivedAt: new Date(),
            waivedBy,
            waiverReason,
            paymentStatus: "WAIVED",
            balance: 0,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                },
            },
        },
    });
    return waivedPenalty;
};
exports.waivePenalty = waivePenalty;
/**
 * Update overdue penalties
 */
const updateOverdueStatus = async () => {
    const now = new Date();
    // Find all unpaid/partial penalties that are past due date
    const overduePenalties = await prisma.penalty.findMany({
        where: {
            isPaid: false,
            isWaived: false,
            dueDate: {
                lt: now,
            },
            isOverdue: false,
        },
    });
    if (overduePenalties.length === 0) {
        return {
            message: "No penalties to update",
            count: 0,
        };
    }
    // Update penalties to overdue
    const updates = overduePenalties.map((penalty) => {
        const daysOverdue = Math.floor((now.getTime() - penalty.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return prisma.penalty.update({
            where: { id: penalty.id },
            data: {
                isOverdue: true,
                daysOverdue,
                paymentStatus: penalty.paymentStatus === "UNPAID"
                    ? "OVERDUE"
                    : penalty.paymentStatus,
            },
        });
    });
    await Promise.all(updates);
    return {
        message: `${overduePenalties.length} penalties marked as overdue`,
        count: overduePenalties.length,
    };
};
exports.updateOverdueStatus = updateOverdueStatus;
/**
 * Generate penalty report
 */
const generatePenaltyReport = async (filters) => {
    const { parentId, meetingId, paymentStatus, dateFrom, dateTo, includeStats = true, groupBy, } = filters;
    // Build where clause
    const where = {
        createdAt: {
            gte: dateFrom,
            lte: dateTo,
        },
    };
    if (parentId) {
        where.parentId = parentId;
    }
    if (meetingId) {
        where.meetingId = meetingId;
    }
    if (paymentStatus) {
        where.paymentStatus = paymentStatus;
    }
    // Get all penalties
    const penalties = await prisma.penalty.findMany({
        where,
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    meetingType: true,
                },
            },
            payments: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    let report = {
        dateRange: {
            from: dateFrom,
            to: dateTo,
        },
        totalRecords: penalties.length,
        penalties,
    };
    // Calculate statistics if requested
    if (includeStats) {
        const stats = {
            totalPenalties: penalties.length,
            totalAmount: penalties.reduce((sum, p) => sum + p.amount, 0),
            totalPaid: penalties.filter((p) => p.isPaid).length,
            totalUnpaid: penalties.filter((p) => !p.isPaid && !p.isWaived).length,
            totalWaived: penalties.filter((p) => p.isWaived).length,
            totalOverdue: penalties.filter((p) => p.isOverdue).length,
            totalAmountPaid: penalties.reduce((sum, p) => sum + p.amountPaid, 0),
            totalBalance: penalties.reduce((sum, p) => sum + p.balance, 0),
            paymentRate: penalties.length > 0
                ? ((penalties.filter((p) => p.isPaid).length / penalties.length) *
                    100).toFixed(2)
                : 0,
            statusBreakdown: {
                UNPAID: penalties.filter((p) => p.paymentStatus === "UNPAID").length,
                PARTIAL: penalties.filter((p) => p.paymentStatus === "PARTIAL").length,
                PAID: penalties.filter((p) => p.paymentStatus === "PAID").length,
                WAIVED: penalties.filter((p) => p.paymentStatus === "WAIVED").length,
                OVERDUE: penalties.filter((p) => p.paymentStatus === "OVERDUE").length,
            },
        };
        report.statistics = stats;
    }
    // Group data if requested
    if (groupBy) {
        if (groupBy === "parent") {
            const grouped = penalties.reduce((acc, curr) => {
                const key = curr.parentId;
                if (!acc[key]) {
                    acc[key] = {
                        parent: curr.parent,
                        penalties: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                acc[key].penalties.push(curr);
                acc[key].totalAmount += curr.amount;
                acc[key].totalPaid += curr.amountPaid;
                acc[key].totalBalance += curr.balance;
                return acc;
            }, {});
            report.groupedData = Object.values(grouped);
        }
        else if (groupBy === "meeting") {
            const grouped = penalties.reduce((acc, curr) => {
                const key = curr.meetingId || "no-meeting";
                if (!acc[key]) {
                    acc[key] = {
                        meeting: curr.meeting,
                        penalties: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                acc[key].penalties.push(curr);
                acc[key].totalAmount += curr.amount;
                acc[key].totalPaid += curr.amountPaid;
                acc[key].totalBalance += curr.balance;
                return acc;
            }, {});
            report.groupedData = Object.values(grouped);
        }
        else if (groupBy === "status") {
            const grouped = penalties.reduce((acc, curr) => {
                const key = curr.paymentStatus;
                if (!acc[key]) {
                    acc[key] = {
                        status: key,
                        penalties: [],
                        totalAmount: 0,
                        totalPaid: 0,
                        totalBalance: 0,
                    };
                }
                acc[key].penalties.push(curr);
                acc[key].totalAmount += curr.amount;
                acc[key].totalPaid += curr.amountPaid;
                acc[key].totalBalance += curr.balance;
                return acc;
            }, {});
            report.groupedData = Object.values(grouped);
        }
    }
    return report;
};
exports.generatePenaltyReport = generatePenaltyReport;
/**
 * Get penalty statistics
 */
const getPenaltyStats = async (filters) => {
    // Build where clause
    const where = {};
    if (filters?.parentId) {
        where.parentId = filters.parentId;
    }
    if (filters?.meetingId) {
        where.meetingId = filters.meetingId;
    }
    if (filters?.dateFrom || filters?.dateTo) {
        const dateFilter = {};
        if (filters.dateFrom) {
            dateFilter.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
            dateFilter.lte = filters.dateTo;
        }
        where.createdAt = dateFilter;
    }
    // Get all penalties
    const penalties = await prisma.penalty.findMany({
        where,
        include: {
            payments: true,
        },
    });
    // Calculate statistics
    const totalPenalties = penalties.length;
    const totalAmount = penalties.reduce((sum, p) => sum + p.amount, 0);
    const totalAmountPaid = penalties.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalBalance = penalties.reduce((sum, p) => sum + p.balance, 0);
    const paidCount = penalties.filter((p) => p.isPaid).length;
    const unpaidCount = penalties.filter((p) => !p.isPaid && !p.isWaived).length;
    const waivedCount = penalties.filter((p) => p.isWaived).length;
    const overdueCount = penalties.filter((p) => p.isOverdue).length;
    const partialCount = penalties.filter((p) => p.paymentStatus === "PARTIAL").length;
    // Payment rate
    const paymentRate = totalPenalties > 0 ? ((paidCount / totalPenalties) * 100).toFixed(2) : 0;
    // Collection rate (amount collected / total amount)
    const collectionRate = totalAmount > 0 ? ((totalAmountPaid / totalAmount) * 100).toFixed(2) : 0;
    // Average penalty amount
    const averagePenaltyAmount = totalPenalties > 0 ? (totalAmount / totalPenalties).toFixed(2) : 0;
    // Average payment amount
    const paymentsCount = penalties.reduce((sum, p) => sum + p.payments.length, 0);
    const averagePaymentAmount = paymentsCount > 0 ? (totalAmountPaid / paymentsCount).toFixed(2) : 0;
    return {
        totalPenalties,
        totalAmount,
        totalAmountPaid,
        totalBalance,
        paymentRate,
        collectionRate,
        statusCounts: {
            paid: paidCount,
            unpaid: unpaidCount,
            partial: partialCount,
            waived: waivedCount,
            overdue: overdueCount,
        },
        statusBreakdown: {
            UNPAID: {
                count: penalties.filter((p) => p.paymentStatus === "UNPAID").length,
                percentage: totalPenalties > 0
                    ? ((penalties.filter((p) => p.paymentStatus === "UNPAID").length /
                        totalPenalties) *
                        100).toFixed(2)
                    : 0,
            },
            PARTIAL: {
                count: partialCount,
                percentage: totalPenalties > 0
                    ? ((partialCount / totalPenalties) * 100).toFixed(2)
                    : 0,
            },
            PAID: {
                count: paidCount,
                percentage: totalPenalties > 0
                    ? ((paidCount / totalPenalties) * 100).toFixed(2)
                    : 0,
            },
            WAIVED: {
                count: waivedCount,
                percentage: totalPenalties > 0
                    ? ((waivedCount / totalPenalties) * 100).toFixed(2)
                    : 0,
            },
            OVERDUE: {
                count: overdueCount,
                percentage: totalPenalties > 0
                    ? ((overdueCount / totalPenalties) * 100).toFixed(2)
                    : 0,
            },
        },
        averages: {
            penaltyAmount: averagePenaltyAmount,
            paymentAmount: averagePaymentAmount,
        },
    };
};
exports.getPenaltyStats = getPenaltyStats;
//# sourceMappingURL=penalties.service.js.map