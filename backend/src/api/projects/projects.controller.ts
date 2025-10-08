import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import * as projectService from "./projects.service";
import ApiError from "../../utils/ApiError";

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Admin only)
 */
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const data = {
      ...req.body,
      createdById: req.user?.id,
    };

    if (!data.createdById) {
      throw new ApiError(401, "User not authenticated");
    }

    const project = await projectService.createProject(data);

    res
      .status(201)
      .json(new ApiResponse(201, project, "Project created successfully"));
  }
);

/**
 * @desc    Get projects with filtering
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as any,
    priority: req.query.priority as any,
    createdById: req.query.createdById
      ? parseInt(req.query.createdById as string)
      : undefined,
    dateFrom: req.query.dateFrom
      ? new Date(req.query.dateFrom as string)
      : undefined,
    dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
    search: req.query.search as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
  };

  const result = await projectService.getProjects(filters);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Projects retrieved successfully"));
});

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const project = await projectService.getProjectById(id);

    res
      .status(200)
      .json(new ApiResponse(200, project, "Project retrieved successfully"));
  }
);

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin only)
 */
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body;

    const project = await projectService.updateProject(id, data);

    res
      .status(200)
      .json(new ApiResponse(200, project, "Project updated successfully"));
  }
);

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const result = await projectService.deleteProject(id);

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Record an expense for a project
 * @route   POST /api/projects/:id/expenses
 * @access  Private (Admin only)
 */
export const recordExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const expenseData = {
      ...req.body,
      recordedBy: req.user?.id,
    };

    if (!expenseData.recordedBy) {
      throw new ApiError(401, "User not authenticated");
    }

    const result = await projectService.recordExpense(projectId, expenseData);

    res
      .status(201)
      .json(new ApiResponse(201, result, "Expense recorded successfully"));
  }
);

/**
 * @desc    Get project expenses
 * @route   GET /api/projects/:id/expenses
 * @access  Private
 */
export const getProjectExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const filters = {
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
      category: req.query.category as string,
    };

    const result = await projectService.getProjectExpenses(projectId, filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Project expenses retrieved successfully")
      );
  }
);

/**
 * @desc    Update an expense
 * @route   PUT /api/projects/:id/expenses/:expenseId
 * @access  Private (Admin only)
 */
export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const expenseId = parseInt(req.params.expenseId);
    const data = req.body;

    const expense = await projectService.updateExpense(
      projectId,
      expenseId,
      data
    );

    res
      .status(200)
      .json(new ApiResponse(200, expense, "Expense updated successfully"));
  }
);

/**
 * @desc    Delete an expense
 * @route   DELETE /api/projects/:id/expenses/:expenseId
 * @access  Private (Admin only)
 */
export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const expenseId = parseInt(req.params.expenseId);

    const result = await projectService.deleteExpense(projectId, expenseId);

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Create a project update/post
 * @route   POST /api/projects/:id/updates
 * @access  Private (Admin only)
 */
export const createProjectUpdate = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const data = {
      ...req.body,
      postedBy: req.user?.id,
    };

    if (!data.postedBy) {
      throw new ApiError(401, "User not authenticated");
    }

    const update = await projectService.createProjectUpdate(projectId, data);

    res
      .status(201)
      .json(
        new ApiResponse(201, update, "Project update created successfully")
      );
  }
);

/**
 * @desc    Get project updates
 * @route   GET /api/projects/:id/updates
 * @access  Private
 */
export const getProjectUpdates = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const isPublic =
      req.query.isPublic === "true"
        ? true
        : req.query.isPublic === "false"
        ? false
        : undefined;

    const updates = await projectService.getProjectUpdates(projectId, isPublic);

    res
      .status(200)
      .json(
        new ApiResponse(200, updates, "Project updates retrieved successfully")
      );
  }
);

/**
 * @desc    Update a project update
 * @route   PUT /api/projects/:id/updates/:updateId
 * @access  Private (Admin only)
 */
export const updateProjectUpdate = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);
    const data = req.body;

    const update = await projectService.updateProjectUpdate(
      projectId,
      updateId,
      data
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, update, "Project update updated successfully")
      );
  }
);

/**
 * @desc    Delete a project update
 * @route   DELETE /api/projects/:id/updates/:updateId
 * @access  Private (Admin only)
 */
export const deleteProjectUpdate = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);

    const result = await projectService.deleteProjectUpdate(
      projectId,
      updateId
    );

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Update project raised funds from contributions
 * @route   POST /api/projects/:id/update-raised
 * @access  Private (Admin only)
 */
export const updateProjectRaisedFunds = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);

    const project = await projectService.updateProjectRaisedFunds(projectId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          project,
          "Project raised funds updated successfully"
        )
      );
  }
);

/**
 * @desc    Generate project report
 * @route   GET /api/projects/report
 * @access  Private (Admin only)
 */
export const generateProjectReport = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      status: req.query.status as any,
      priority: req.query.priority as any,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      includeStats: req.query.includeStats === "false" ? false : true,
      includeExpenses: req.query.includeExpenses === "false" ? false : true,
      includeContributions:
        req.query.includeContributions === "false" ? false : true,
    };

    const report = await projectService.generateProjectReport(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, report, "Project report generated successfully")
      );
  }
);

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Private
 */
export const getProjectStats = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      status: req.query.status as any,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
    };

    const stats = await projectService.getProjectStats(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Project statistics retrieved successfully")
      );
  }
);
