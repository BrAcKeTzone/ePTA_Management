import { ProjectStatus, ProjectPriority } from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
const cloudinary = require("../../configs/cloudinary");

interface CreateProjectData {
  name: string;
  description?: string;
  budget: number;
  fundingGoal?: number;
  targetBeneficiaries?: number;
  priority?: ProjectPriority;
  startDate: Date;
  endDate?: Date;
  location?: string;
  venue?: string;
  notes?: string;
  createdById: number;
}

interface GetProjectsFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  createdById?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  budget?: number;
  fundingGoal?: number;
  targetBeneficiaries?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  completedDate?: Date;
  progressPercentage?: number;
  location?: string;
  venue?: string;
  notes?: string;
  cancellationReason?: string;
  completionImages?: string;
}

interface RecordExpenseData {
  title: string;
  description?: string;
  amount: number;
  category?: string;
  expenseDate?: Date;
  receipt?: string;
  notes?: string;
  recordedBy: number;
}

interface CreateProjectUpdateData {
  title: string;
  content: string;
  isPublic?: boolean;
  isMilestone?: boolean;
  attachments?: string;
  postedBy: number;
}

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectData) => {
  const balance = data.budget; // Initial balance equals budget

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      budget: data.budget,
      balance,
      fundingGoal: data.fundingGoal,
      targetBeneficiaries: data.targetBeneficiaries,
      priority: data.priority || ProjectPriority.MEDIUM,
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
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
        },
      },
    },
  });

  return project;
};

/**
 * Get projects with filtering and pagination
 */
export const getProjects = async (filters: GetProjectsFilters) => {
  const {
    status,
    priority,
    createdById,
    dateFrom,
    dateTo,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const where: any = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (createdById) where.createdById = createdById;

  // Date range filter
  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = dateFrom;
    if (dateTo) where.startDate.lte = dateTo;
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
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
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
    prisma.project.count({ where }),
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

/**
 * Get project by ID
 */
export const getProjectById = async (id: number) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
        },
      },
      contributions: {
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
    throw new ApiError(404, "Project not found");
  }

  return project;
};

/**
 * Update project
 */
export const updateProject = async (id: number, data: UpdateProjectData) => {
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  // Recalculate balance if budget changes
  let balance = existingProject.balance;
  if (data.budget !== undefined) {
    const budgetDiff = data.budget - existingProject.budget;
    balance = existingProject.balance + budgetDiff;
  }

  // Auto-set completedDate when status changes to COMPLETED
  const updateData: any = { ...data, balance };
  if (data.status === ProjectStatus.COMPLETED && !data.completedDate) {
    updateData.completedDate = new Date();
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
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

/**
 * Delete project
 */
export const deleteProject = async (id: number) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      contributions: true,
      expenses: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if project has contributions or expenses
  if (project.contributions.length > 0 || project.expenses.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete project with contributions or expenses. Consider marking it as CANCELLED instead."
    );
  }

  await prisma.project.delete({ where: { id } });

  return { message: "Project deleted successfully" };
};

/**
 * Record an expense for a project
 */
export const recordExpense = async (
  projectId: number,
  data: RecordExpenseData
) => {
  // Get project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if expense exceeds remaining balance
  if (data.amount > project.balance) {
    throw new ApiError(
      400,
      `Expense amount (${data.amount}) exceeds remaining budget balance (${project.balance})`
    );
  }

  // Use transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
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
            firstName: true,
            lastName: true,
            middleName: true,
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

/**
 * Get expenses for a project
 */
export const getProjectExpenses = async (
  projectId: number,
  filters?: { dateFrom?: Date; dateTo?: Date; category?: string }
) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const where: any = { projectId };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.expenseDate = {};
    if (filters.dateFrom) where.expenseDate.gte = filters.dateFrom;
    if (filters.dateTo) where.expenseDate.lte = filters.dateTo;
  }

  const expenses = await prisma.projectExpense.findMany({
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

/**
 * Update an expense
 */
export const updateExpense = async (
  projectId: number,
  expenseId: number,
  data: Partial<RecordExpenseData>
) => {
  // Get expense
  const expense = await prisma.projectExpense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.projectId !== projectId) {
    throw new ApiError(404, "Expense not found");
  }

  // If amount is being changed, update project financials
  if (data.amount !== undefined && data.amount !== expense.amount) {
    const amountDiff = data.amount - expense.amount;

    // Get project to check balance
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Check if new amount exceeds budget
    if (amountDiff > project.balance) {
      throw new ApiError(
        400,
        `Expense increase exceeds remaining budget balance`
      );
    }

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
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
  const updatedExpense = await prisma.projectExpense.update({
    where: { id: expenseId },
    data,
  });

  return updatedExpense;
};

/**
 * Delete an expense
 */
export const deleteExpense = async (projectId: number, expenseId: number) => {
  // Get expense
  const expense = await prisma.projectExpense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.projectId !== projectId) {
    throw new ApiError(404, "Expense not found");
  }

  // Use transaction to revert project financials
  await prisma.$transaction(async (tx) => {
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

/**
 * Create a project update/post
 */
export const createProjectUpdate = async (
  projectId: number,
  data: CreateProjectUpdateData
) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const update = await prisma.projectUpdate.create({
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

/**
 * Get project updates
 */
export const getProjectUpdates = async (
  projectId: number,
  isPublic?: boolean
) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const where: any = { projectId };
  if (typeof isPublic === "boolean") {
    where.isPublic = isPublic;
  }

  const updates = await prisma.projectUpdate.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return updates;
};

/**
 * Update a project update
 */
export const updateProjectUpdate = async (
  projectId: number,
  updateId: number,
  data: Partial<CreateProjectUpdateData>
) => {
  // Get update
  const update = await prisma.projectUpdate.findUnique({
    where: { id: updateId },
  });

  if (!update || update.projectId !== projectId) {
    throw new ApiError(404, "Project update not found");
  }

  const updatedUpdate = await prisma.projectUpdate.update({
    where: { id: updateId },
    data,
  });

  return updatedUpdate;
};

/**
 * Delete a project update
 */
export const deleteProjectUpdate = async (
  projectId: number,
  updateId: number
) => {
  // Get update
  const update = await prisma.projectUpdate.findUnique({
    where: { id: updateId },
  });

  if (!update || update.projectId !== projectId) {
    throw new ApiError(404, "Project update not found");
  }

  await prisma.projectUpdate.delete({
    where: { id: updateId },
  });

  return { message: "Project update deleted successfully" };
};

/**
 * Calculate and update project raised funds from contributions
 */
export const updateProjectRaisedFunds = async (projectId: number) => {
  const contributions = await prisma.contribution.findMany({
    where: { projectId },
  });

  const totalRaised = contributions.reduce((sum, c) => sum + c.amountPaid, 0);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { totalRaised },
  });

  return project;
};

/**
 * Generate project report
 */
export const generateProjectReport = async (filters: any) => {
  const {
    projectId,
    status,
    priority,
    dateFrom,
    dateTo,
    includeStats = true,
    includeExpenses = true,
    includeContributions = true,
  } = filters;

  const where: any = {};

  if (projectId) where.id = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  // Date range filter
  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = new Date(dateFrom);
    if (dateTo) where.startDate.lte = new Date(dateTo);
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
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

  const report: any = {
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
      PLANNING: projects.filter((p) => p.status === ProjectStatus.PLANNING)
        .length,
      ACTIVE: projects.filter((p) => p.status === ProjectStatus.ACTIVE).length,
      ON_HOLD: projects.filter((p) => p.status === ProjectStatus.ON_HOLD)
        .length,
      COMPLETED: projects.filter((p) => p.status === ProjectStatus.COMPLETED)
        .length,
      CANCELLED: projects.filter((p) => p.status === ProjectStatus.CANCELLED)
        .length,
    };

    report.statistics = {
      totalProjects,
      totalBudget,
      totalRaised,
      totalExpenses,
      totalBalance,
      averageProgress:
        totalProjects > 0
          ? (
              projects.reduce((sum, p) => sum + p.progressPercentage, 0) /
              totalProjects
            ).toFixed(2)
          : "0.00",
      fundingProgress:
        totalBudget > 0
          ? ((totalRaised / totalBudget) * 100).toFixed(2)
          : "0.00",
      statusBreakdown: statusCounts,
    };
  }

  return report;
};

/**
 * Get project statistics
 */
export const getProjectStats = async (filters: any) => {
  const { projectId, status, dateFrom, dateTo } = filters;

  const where: any = {};

  if (projectId) where.id = projectId;
  if (status) where.status = status;

  // Date range filter
  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = new Date(dateFrom);
    if (dateTo) where.startDate.lte = new Date(dateTo);
  }

  const projects = await prisma.project.findMany({
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
    planning: projects.filter((p) => p.status === ProjectStatus.PLANNING)
      .length,
    active: projects.filter((p) => p.status === ProjectStatus.ACTIVE).length,
    onHold: projects.filter((p) => p.status === ProjectStatus.ON_HOLD).length,
    completed: projects.filter((p) => p.status === ProjectStatus.COMPLETED)
      .length,
    cancelled: projects.filter((p) => p.status === ProjectStatus.CANCELLED)
      .length,
  };

  const priorityCounts: any = {};
  projects.forEach((p) => {
    priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
  });

  return {
    totalProjects,
    totalBudget,
    totalRaised,
    totalExpenses,
    totalBalance,
    averageProgress:
      totalProjects > 0
        ? (
            projects.reduce((sum, p) => sum + p.progressPercentage, 0) /
            totalProjects
          ).toFixed(2)
        : "0.00",
    fundingProgress:
      totalBudget > 0 ? ((totalRaised / totalBudget) * 100).toFixed(2) : "0.00",
    budgetUtilization:
      totalBudget > 0
        ? ((totalExpenses / totalBudget) * 100).toFixed(2)
        : "0.00",
    statusCounts,
    statusBreakdown: {
      PLANNING: {
        count: statusCounts.planning,
        percentage:
          totalProjects > 0
            ? ((statusCounts.planning / totalProjects) * 100).toFixed(2)
            : "0.00",
      },
      ACTIVE: {
        count: statusCounts.active,
        percentage:
          totalProjects > 0
            ? ((statusCounts.active / totalProjects) * 100).toFixed(2)
            : "0.00",
      },
      ON_HOLD: {
        count: statusCounts.onHold,
        percentage:
          totalProjects > 0
            ? ((statusCounts.onHold / totalProjects) * 100).toFixed(2)
            : "0.00",
      },
      COMPLETED: {
        count: statusCounts.completed,
        percentage:
          totalProjects > 0
            ? ((statusCounts.completed / totalProjects) * 100).toFixed(2)
            : "0.00",
      },
      CANCELLED: {
        count: statusCounts.cancelled,
        percentage:
          totalProjects > 0
            ? ((statusCounts.cancelled / totalProjects) * 100).toFixed(2)
            : "0.00",
      },
    },
    priorityBreakdown: priorityCounts,
    averages: {
      budget:
        totalProjects > 0 ? (totalBudget / totalProjects).toFixed(2) : "0.00",
      raised:
        totalProjects > 0 ? (totalRaised / totalProjects).toFixed(2) : "0.00",
      expenses:
        totalProjects > 0 ? (totalExpenses / totalProjects).toFixed(2) : "0.00",
    },
  };
};

/**
 * Get all documents from all projects
 */
export const getAllDocuments = async (filters: any = {}) => {
  const { page = 1, limit = 10, projectId, search } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
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
    prisma.project.findMany({
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
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where: whereClause }),
  ]);

  // Parse attachments and flatten documents
  const documents: any[] = [];
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
              fileName:
                attachment.name ||
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
      } catch (error) {
        console.error(
          `Error parsing attachments for project ${project.id}:`,
          error
        );
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

// Get public documents from project updates
export const getPublicDocuments = async (filters: any = {}) => {
  const { page = 1, limit = 10, projectId, search } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
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
    prisma.projectUpdate.findMany({
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
    prisma.projectUpdate.count({ where: whereClause }),
  ]);

  // Parse attachments and flatten documents
  const documents: any[] = [];
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
              fileName:
                attachment.name ||
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
      } catch (error) {
        console.error(
          `Error parsing attachments for update ${update.id}:`,
          error
        );
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

/**
 * Upload completion images to Cloudinary
 */
export const uploadCompletionImages = async (
  projectId: number,
  files: Express.Multer.File[]
) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Allow uploads for COMPLETED projects or projects that will be marked as COMPLETED
  // (No strict validation here - let frontend control when images can be uploaded)

  // Parse existing images
  let existingImages: string[] = [];
  if (project.completionImages) {
    try {
      existingImages = JSON.parse(project.completionImages);
      if (!Array.isArray(existingImages)) {
        existingImages = [];
      }
    } catch (error) {
      existingImages = [];
    }
  }

  // Upload each file to Cloudinary
  const uploadPromises = files.map((file) => {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "epta/project-completions",
          public_id: `project-${projectId}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`,
          resource_type: "auto",
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  });

  const uploadedUrls = await Promise.all(uploadPromises);

  // Combine with existing images
  const allImages = [...existingImages, ...uploadedUrls];

  // Update project with new image URLs
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      completionImages: JSON.stringify(allImages),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
        },
      },
    },
  });

  return {
    project: updatedProject,
    uploadedImages: uploadedUrls,
    totalImages: allImages.length,
  };
};

/**
 * Delete a completion image from Cloudinary
 */
export const deleteCompletionImage = async (
  projectId: number,
  imageUrl: string
) => {
  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Parse existing images
  let existingImages: string[] = [];
  if (project.completionImages) {
    try {
      existingImages = JSON.parse(project.completionImages);
      if (!Array.isArray(existingImages)) {
        throw new ApiError(400, "Invalid completion images format");
      }
    } catch (error) {
      throw new ApiError(400, "Invalid completion images format");
    }
  }

  // Check if image exists in the array
  if (!existingImages.includes(imageUrl)) {
    throw new ApiError(404, "Image not found in project completion images");
  }

  // Extract public_id from Cloudinary URL
  try {
    const urlParts = imageUrl.split("/");
    const fileWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileWithExtension.split(".")[0];
    const folder = "epta/project-completions";
    const publicId = `${folder}/${fileName}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Continue even if Cloudinary deletion fails
  }

  // Remove image from array
  const updatedImages = existingImages.filter((img) => img !== imageUrl);

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      completionImages: JSON.stringify(updatedImages),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          email: true,
        },
      },
    },
  });

  return {
    project: updatedProject,
    deletedImage: imageUrl,
    remainingImages: updatedImages.length,
  };
};
