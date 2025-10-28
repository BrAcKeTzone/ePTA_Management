"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicDocuments = exports.getAllDocuments = exports.getProjectStats = exports.generateProjectReport = exports.updateProjectRaisedFunds = exports.deleteProjectUpdate = exports.updateProjectUpdate = exports.getProjectUpdates = exports.createProjectUpdate = exports.deleteExpense = exports.updateExpense = exports.getProjectExpenses = exports.recordExpense = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
/**
 * Create a new project
 */
const createProject = async (data) => {
    const balance = data.budget; // Initial balance equals budget
    const project = await prisma_1.default.project.create({
        data: {
            name: data.name,
            description: data.description,
            budget: data.budget,
            balance,
            fundingGoal: data.fundingGoal,
            targetBeneficiaries: data.targetBeneficiaries,
            priority: data.priority || client_1.ProjectPriority.MEDIUM,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            venue: data.venue,
            notes: data.notes,
            createdById: data.createdById,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    return project;
};
exports.createProject = createProject;
/**
 * Get projects with filtering and pagination
 */
const getProjects = async (filters) => {
    const { status, priority, createdById, dateFrom, dateTo, search, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = filters;
    const where = {};
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    if (createdById)
        where.createdById = createdById;
    // Date range filter
    if (dateFrom || dateTo) {
        where.startDate = {};
        if (dateFrom)
            where.startDate.gte = dateFrom;
        if (dateTo)
            where.startDate.lte = dateTo;
    }
    // Search filter (name or description)
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ];
    }
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
        prisma_1.default.project.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                contributions: {
                    select: {
                        id: true,
                        amount: true,
                        amountPaid: true,
                        status: true,
                    },
                },
                expenses: {
                    select: {
                        id: true,
                        amount: true,
                        expenseDate: true,
                    },
                    orderBy: { expenseDate: "desc" },
                    take: 5,
                },
                _count: {
                    select: {
                        contributions: true,
                        expenses: true,
                        updates: true,
                    },
                },
            },
        }),
        prisma_1.default.project.count({ where }),
    ]);
    return {
        projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getProjects = getProjects;
/**
 * Get project by ID
 */
const getProjectById = async (id) => {
    const project = await prisma_1.default.project.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            contributions: {
                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            expenses: {
                orderBy: { expenseDate: "desc" },
            },
            updates: {
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: {
                    contributions: true,
                    expenses: true,
                    updates: true,
                },
            },
        },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    return project;
};
exports.getProjectById = getProjectById;
/**
 * Update project
 */
const updateProject = async (id, data) => {
    // Check if project exists
    const existingProject = await prisma_1.default.project.findUnique({
        where: { id },
    });
    if (!existingProject) {
        throw new ApiError_1.default(404, "Project not found");
    }
    // Recalculate balance if budget changes
    let balance = existingProject.balance;
    if (data.budget !== undefined) {
        const budgetDiff = data.budget - existingProject.budget;
        balance = existingProject.balance + budgetDiff;
    }
    // Auto-set completedDate when status changes to COMPLETED
    const updateData = { ...data, balance };
    if (data.status === client_1.ProjectStatus.COMPLETED && !data.completedDate) {
        updateData.completedDate = new Date();
    }
    const project = await prisma_1.default.project.update({
        where: { id },
        data: updateData,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    contributions: true,
                    expenses: true,
                    updates: true,
                },
            },
        },
    });
    return project;
};
exports.updateProject = updateProject;
/**
 * Delete project
 */
const deleteProject = async (id) => {
    // Check if project exists
    const project = await prisma_1.default.project.findUnique({
        where: { id },
        include: {
            contributions: true,
            expenses: true,
        },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    // Check if project has contributions or expenses
    if (project.contributions.length > 0 || project.expenses.length > 0) {
        throw new ApiError_1.default(400, "Cannot delete project with contributions or expenses. Consider marking it as CANCELLED instead.");
    }
    await prisma_1.default.project.delete({ where: { id } });
    return { message: "Project deleted successfully" };
};
exports.deleteProject = deleteProject;
/**
 * Record an expense for a project
 */
const recordExpense = async (projectId, data) => {
    // Get project
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    // Check if expense exceeds remaining balance
    if (data.amount > project.balance) {
        throw new ApiError_1.default(400, `Expense amount (${data.amount}) exceeds remaining budget balance (${project.balance})`);
    }
    // Use transaction to ensure data consistency
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Create expense record
        const expense = await tx.projectExpense.create({
            data: {
                projectId,
                title: data.title,
                description: data.description,
                amount: data.amount,
                category: data.category,
                expenseDate: data.expenseDate || new Date(),
                receipt: data.receipt,
                notes: data.notes,
                recordedBy: data.recordedBy,
            },
        });
        // Update project financials
        const updatedProject = await tx.project.update({
            where: { id: projectId },
            data: {
                totalExpenses: { increment: data.amount },
                balance: { decrement: data.amount },
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                expenses: {
                    orderBy: { expenseDate: "desc" },
                    take: 10,
                },
            },
        });
        return { expense, project: updatedProject };
    });
    return result;
};
exports.recordExpense = recordExpense;
/**
 * Get expenses for a project
 */
const getProjectExpenses = async (projectId, filters) => {
    // Check if project exists
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    const where = { projectId };
    if (filters?.category) {
        where.category = filters.category;
    }
    if (filters?.dateFrom || filters?.dateTo) {
        where.expenseDate = {};
        if (filters.dateFrom)
            where.expenseDate.gte = filters.dateFrom;
        if (filters.dateTo)
            where.expenseDate.lte = filters.dateTo;
    }
    const expenses = await prisma_1.default.projectExpense.findMany({
        where,
        orderBy: { expenseDate: "desc" },
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
        expenses,
        summary: {
            totalExpenses,
            count: expenses.length,
        },
    };
};
exports.getProjectExpenses = getProjectExpenses;
/**
 * Update an expense
 */
const updateExpense = async (projectId, expenseId, data) => {
    // Get expense
    const expense = await prisma_1.default.projectExpense.findUnique({
        where: { id: expenseId },
    });
    if (!expense || expense.projectId !== projectId) {
        throw new ApiError_1.default(404, "Expense not found");
    }
    // If amount is being changed, update project financials
    if (data.amount !== undefined && data.amount !== expense.amount) {
        const amountDiff = data.amount - expense.amount;
        // Get project to check balance
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new ApiError_1.default(404, "Project not found");
        }
        // Check if new amount exceeds budget
        if (amountDiff > project.balance) {
            throw new ApiError_1.default(400, `Expense increase exceeds remaining budget balance`);
        }
        // Use transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updatedExpense = await tx.projectExpense.update({
                where: { id: expenseId },
                data,
            });
            await tx.project.update({
                where: { id: projectId },
                data: {
                    totalExpenses: { increment: amountDiff },
                    balance: { decrement: amountDiff },
                },
            });
            return updatedExpense;
        });
        return result;
    }
    // No amount change, just update expense
    const updatedExpense = await prisma_1.default.projectExpense.update({
        where: { id: expenseId },
        data,
    });
    return updatedExpense;
};
exports.updateExpense = updateExpense;
/**
 * Delete an expense
 */
const deleteExpense = async (projectId, expenseId) => {
    // Get expense
    const expense = await prisma_1.default.projectExpense.findUnique({
        where: { id: expenseId },
    });
    if (!expense || expense.projectId !== projectId) {
        throw new ApiError_1.default(404, "Expense not found");
    }
    // Use transaction to revert project financials
    await prisma_1.default.$transaction(async (tx) => {
        await tx.projectExpense.delete({
            where: { id: expenseId },
        });
        await tx.project.update({
            where: { id: projectId },
            data: {
                totalExpenses: { decrement: expense.amount },
                balance: { increment: expense.amount },
            },
        });
    });
    return { message: "Expense deleted successfully" };
};
exports.deleteExpense = deleteExpense;
/**
 * Create a project update/post
 */
const createProjectUpdate = async (projectId, data) => {
    // Check if project exists
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    const update = await prisma_1.default.projectUpdate.create({
        data: {
            projectId,
            title: data.title,
            content: data.content,
            isPublic: data.isPublic ?? true,
            isMilestone: data.isMilestone ?? false,
            attachments: data.attachments,
            postedBy: data.postedBy,
        },
    });
    return update;
};
exports.createProjectUpdate = createProjectUpdate;
/**
 * Get project updates
 */
const getProjectUpdates = async (projectId, isPublic) => {
    // Check if project exists
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new ApiError_1.default(404, "Project not found");
    }
    const where = { projectId };
    if (typeof isPublic === "boolean") {
        where.isPublic = isPublic;
    }
    const updates = await prisma_1.default.projectUpdate.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    return updates;
};
exports.getProjectUpdates = getProjectUpdates;
/**
 * Update a project update
 */
const updateProjectUpdate = async (projectId, updateId, data) => {
    // Get update
    const update = await prisma_1.default.projectUpdate.findUnique({
        where: { id: updateId },
    });
    if (!update || update.projectId !== projectId) {
        throw new ApiError_1.default(404, "Project update not found");
    }
    const updatedUpdate = await prisma_1.default.projectUpdate.update({
        where: { id: updateId },
        data,
    });
    return updatedUpdate;
};
exports.updateProjectUpdate = updateProjectUpdate;
/**
 * Delete a project update
 */
const deleteProjectUpdate = async (projectId, updateId) => {
    // Get update
    const update = await prisma_1.default.projectUpdate.findUnique({
        where: { id: updateId },
    });
    if (!update || update.projectId !== projectId) {
        throw new ApiError_1.default(404, "Project update not found");
    }
    await prisma_1.default.projectUpdate.delete({
        where: { id: updateId },
    });
    return { message: "Project update deleted successfully" };
};
exports.deleteProjectUpdate = deleteProjectUpdate;
/**
 * Calculate and update project raised funds from contributions
 */
const updateProjectRaisedFunds = async (projectId) => {
    const contributions = await prisma_1.default.contribution.findMany({
        where: { projectId },
    });
    const totalRaised = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const project = await prisma_1.default.project.update({
        where: { id: projectId },
        data: { totalRaised },
    });
    return project;
};
exports.updateProjectRaisedFunds = updateProjectRaisedFunds;
/**
 * Generate project report
 */
const generateProjectReport = async (filters) => {
    const { projectId, status, priority, dateFrom, dateTo, includeStats = true, includeExpenses = true, includeContributions = true, } = filters;
    const where = {};
    if (projectId)
        where.id = projectId;
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    // Date range filter
    if (dateFrom || dateTo) {
        where.startDate = {};
        if (dateFrom)
            where.startDate.gte = new Date(dateFrom);
        if (dateTo)
            where.startDate.lte = new Date(dateTo);
    }
    const projects = await prisma_1.default.project.findMany({
        where,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            contributions: includeContributions,
            expenses: includeExpenses,
            _count: {
                select: {
                    contributions: true,
                    expenses: true,
                    updates: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const report = {
        dateRange: {
            from: dateFrom || "All time",
            to: dateTo || "Present",
        },
        totalRecords: projects.length,
        projects,
    };
    // Calculate statistics if requested
    if (includeStats) {
        const totalProjects = projects.length;
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalRaised = projects.reduce((sum, p) => sum + p.totalRaised, 0);
        const totalExpenses = projects.reduce((sum, p) => sum + p.totalExpenses, 0);
        const totalBalance = projects.reduce((sum, p) => sum + p.balance, 0);
        const statusCounts = {
            PLANNING: projects.filter((p) => p.status === client_1.ProjectStatus.PLANNING)
                .length,
            ACTIVE: projects.filter((p) => p.status === client_1.ProjectStatus.ACTIVE).length,
            ON_HOLD: projects.filter((p) => p.status === client_1.ProjectStatus.ON_HOLD)
                .length,
            COMPLETED: projects.filter((p) => p.status === client_1.ProjectStatus.COMPLETED)
                .length,
            CANCELLED: projects.filter((p) => p.status === client_1.ProjectStatus.CANCELLED)
                .length,
        };
        report.statistics = {
            totalProjects,
            totalBudget,
            totalRaised,
            totalExpenses,
            totalBalance,
            averageProgress: totalProjects > 0
                ? (projects.reduce((sum, p) => sum + p.progressPercentage, 0) /
                    totalProjects).toFixed(2)
                : "0.00",
            fundingProgress: totalBudget > 0
                ? ((totalRaised / totalBudget) * 100).toFixed(2)
                : "0.00",
            statusBreakdown: statusCounts,
        };
    }
    return report;
};
exports.generateProjectReport = generateProjectReport;
/**
 * Get project statistics
 */
const getProjectStats = async (filters) => {
    const { projectId, status, dateFrom, dateTo } = filters;
    const where = {};
    if (projectId)
        where.id = projectId;
    if (status)
        where.status = status;
    // Date range filter
    if (dateFrom || dateTo) {
        where.startDate = {};
        if (dateFrom)
            where.startDate.gte = new Date(dateFrom);
        if (dateTo)
            where.startDate.lte = new Date(dateTo);
    }
    const projects = await prisma_1.default.project.findMany({
        where,
        include: {
            contributions: true,
            expenses: true,
        },
    });
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalRaised = projects.reduce((sum, p) => sum + p.totalRaised, 0);
    const totalExpenses = projects.reduce((sum, p) => sum + p.totalExpenses, 0);
    const totalBalance = projects.reduce((sum, p) => sum + p.balance, 0);
    const statusCounts = {
        planning: projects.filter((p) => p.status === client_1.ProjectStatus.PLANNING)
            .length,
        active: projects.filter((p) => p.status === client_1.ProjectStatus.ACTIVE).length,
        onHold: projects.filter((p) => p.status === client_1.ProjectStatus.ON_HOLD).length,
        completed: projects.filter((p) => p.status === client_1.ProjectStatus.COMPLETED)
            .length,
        cancelled: projects.filter((p) => p.status === client_1.ProjectStatus.CANCELLED)
            .length,
    };
    const priorityCounts = {};
    projects.forEach((p) => {
        priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
    });
    return {
        totalProjects,
        totalBudget,
        totalRaised,
        totalExpenses,
        totalBalance,
        averageProgress: totalProjects > 0
            ? (projects.reduce((sum, p) => sum + p.progressPercentage, 0) /
                totalProjects).toFixed(2)
            : "0.00",
        fundingProgress: totalBudget > 0 ? ((totalRaised / totalBudget) * 100).toFixed(2) : "0.00",
        budgetUtilization: totalBudget > 0
            ? ((totalExpenses / totalBudget) * 100).toFixed(2)
            : "0.00",
        statusCounts,
        statusBreakdown: {
            PLANNING: {
                count: statusCounts.planning,
                percentage: totalProjects > 0
                    ? ((statusCounts.planning / totalProjects) * 100).toFixed(2)
                    : "0.00",
            },
            ACTIVE: {
                count: statusCounts.active,
                percentage: totalProjects > 0
                    ? ((statusCounts.active / totalProjects) * 100).toFixed(2)
                    : "0.00",
            },
            ON_HOLD: {
                count: statusCounts.onHold,
                percentage: totalProjects > 0
                    ? ((statusCounts.onHold / totalProjects) * 100).toFixed(2)
                    : "0.00",
            },
            COMPLETED: {
                count: statusCounts.completed,
                percentage: totalProjects > 0
                    ? ((statusCounts.completed / totalProjects) * 100).toFixed(2)
                    : "0.00",
            },
            CANCELLED: {
                count: statusCounts.cancelled,
                percentage: totalProjects > 0
                    ? ((statusCounts.cancelled / totalProjects) * 100).toFixed(2)
                    : "0.00",
            },
        },
        priorityBreakdown: priorityCounts,
        averages: {
            budget: totalProjects > 0 ? (totalBudget / totalProjects).toFixed(2) : "0.00",
            raised: totalProjects > 0 ? (totalRaised / totalProjects).toFixed(2) : "0.00",
            expenses: totalProjects > 0 ? (totalExpenses / totalProjects).toFixed(2) : "0.00",
        },
    };
};
exports.getProjectStats = getProjectStats;
/**
 * Get all documents from all projects
 */
const getAllDocuments = async (filters = {}) => {
    const { page = 1, limit = 10, projectId, search } = filters;
    const skip = (page - 1) * limit;
    const whereClause = {
        attachments: {
            not: null,
        },
    };
    if (projectId) {
        whereClause.id = parseInt(projectId);
    }
    if (search) {
        whereClause.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ];
    }
    const [projects, totalCount] = await Promise.all([
        prisma_1.default.project.findMany({
            where: whereClause,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                description: true,
                attachments: true,
                createdAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.project.count({ where: whereClause }),
    ]);
    // Parse attachments and flatten documents
    const documents = [];
    projects.forEach((project) => {
        if (project.attachments) {
            try {
                const attachments = JSON.parse(project.attachments);
                if (Array.isArray(attachments)) {
                    attachments.forEach((attachment, index) => {
                        documents.push({
                            id: `${project.id}-${index}`,
                            projectId: project.id,
                            projectName: project.name,
                            fileName: attachment.name ||
                                attachment.fileName ||
                                `Document ${index + 1}`,
                            fileUrl: attachment.url || attachment.fileUrl || attachment,
                            fileSize: attachment.size || null,
                            mimeType: attachment.type || attachment.mimeType || null,
                            uploadedAt: project.createdAt,
                            uploadedBy: project.createdBy,
                        });
                    });
                }
            }
            catch (error) {
                console.error(`Error parsing attachments for project ${project.id}:`, error);
            }
        }
    });
    return {
        documents,
        pagination: {
            total: documents.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(documents.length / limit),
        },
    };
};
exports.getAllDocuments = getAllDocuments;
// Get public documents from project updates
const getPublicDocuments = async (filters = {}) => {
    const { page = 1, limit = 10, projectId, search } = filters;
    const skip = (page - 1) * limit;
    const whereClause = {
        isPublic: true,
        attachments: {
            not: null,
        },
    };
    if (projectId) {
        whereClause.projectId = parseInt(projectId);
    }
    if (search) {
        whereClause.OR = [
            { title: { contains: search } },
            { content: { contains: search } },
        ];
    }
    const [updates, totalCount] = await Promise.all([
        prisma_1.default.projectUpdate.findMany({
            where: whereClause,
            skip,
            take: limit,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.projectUpdate.count({ where: whereClause }),
    ]);
    // Parse attachments and flatten documents
    const documents = [];
    updates.forEach((update) => {
        if (update.attachments) {
            try {
                const attachments = JSON.parse(update.attachments);
                if (Array.isArray(attachments)) {
                    attachments.forEach((attachment, index) => {
                        documents.push({
                            id: `update-${update.id}-${index}`,
                            projectId: update.projectId,
                            projectName: update.project.name,
                            updateId: update.id,
                            updateTitle: update.title,
                            fileName: attachment.name ||
                                attachment.fileName ||
                                `Document ${index + 1}`,
                            fileUrl: attachment.url || attachment.fileUrl || attachment,
                            fileSize: attachment.size || null,
                            mimeType: attachment.type || attachment.mimeType || null,
                            uploadedAt: update.createdAt,
                            isPublic: update.isPublic,
                            isMilestone: update.isMilestone,
                        });
                    });
                }
            }
            catch (error) {
                console.error(`Error parsing attachments for update ${update.id}:`, error);
            }
        }
    });
    return {
        documents,
        pagination: {
            total: documents.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(documents.length / limit),
        },
    };
};
exports.getPublicDocuments = getPublicDocuments;
//# sourceMappingURL=projects.service.js.map