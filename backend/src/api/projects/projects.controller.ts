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

/**
 * @desc    Get active projects
 * @route   GET /api/projects/active
 * @access  Private
 */
export const getActiveProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      ...req.query,
      status: "ACTIVE",
    };

    const result = await projectService.getProjects(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Active projects retrieved successfully")
      );
  }
);

/**
 * @desc    Get public documents from all projects
 * @route   GET /api/projects/documents/public
 * @access  Private
 */
export const getPublicDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const documents = await projectService.getPublicDocuments(req.query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          documents,
          "Public documents retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get all documents from all projects
 * @route   GET /api/projects/documents
 * @access  Private
 */
export const getAllDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const documents = await projectService.getAllDocuments(req.query);

    res
      .status(200)
      .json(
        new ApiResponse(200, documents, "All documents retrieved successfully")
      );
  }
);

/**
 * @desc    Download a document
 * @route   GET /api/projects/documents/:documentId/download
 * @access  Private
 */
export const downloadDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.documentId);
    const document = await projectService.getDocumentForDownload(documentId);

    // In a real app, you would stream the file from storage
    res
      .status(200)
      .json(new ApiResponse(200, document, "Document download info retrieved"));
  }
);

/**
 * @desc    Update a document
 * @route   PUT /api/projects/documents/:documentId
 * @access  Private (Admin only)
 */
export const updateDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.documentId);
    const document = await projectService.updateDocument(documentId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, document, "Document updated successfully"));
  }
);

/**
 * @desc    Delete a document
 * @route   DELETE /api/projects/documents/:documentId
 * @access  Private (Admin only)
 */
export const deleteDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.documentId);
    await projectService.deleteDocument(documentId);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Document deleted successfully"));
  }
);

/**
 * @desc    Update project status
 * @route   PATCH /api/projects/:id/status
 * @access  Private (Admin only)
 */
export const updateProjectStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const { status } = req.body;

    const project = await projectService.updateProjectStatus(projectId, status);

    res
      .status(200)
      .json(
        new ApiResponse(200, project, "Project status updated successfully")
      );
  }
);

/**
 * @desc    Get project accomplishments
 * @route   GET /api/projects/:id/accomplishments
 * @access  Private
 */
export const getProjectAccomplishments = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const accomplishments = await projectService.getProjectAccomplishments(
      projectId
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accomplishments,
          "Project accomplishments retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Create accomplishment
 * @route   POST /api/projects/:id/accomplishments
 * @access  Private (Admin only)
 */
export const createAccomplishment = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const accomplishment = await projectService.createAccomplishment(
      projectId,
      req.body
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          accomplishment,
          "Accomplishment created successfully"
        )
      );
  }
);

/**
 * @desc    Update accomplishment
 * @route   PUT /api/projects/:id/accomplishments/:accomplishmentId
 * @access  Private (Admin only)
 */
export const updateAccomplishment = asyncHandler(
  async (req: Request, res: Response) => {
    const accomplishmentId = parseInt(req.params.accomplishmentId);
    const accomplishment = await projectService.updateAccomplishment(
      accomplishmentId,
      req.body
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accomplishment,
          "Accomplishment updated successfully"
        )
      );
  }
);

/**
 * @desc    Delete accomplishment
 * @route   DELETE /api/projects/:id/accomplishments/:accomplishmentId
 * @access  Private (Admin only)
 */
export const deleteAccomplishment = asyncHandler(
  async (req: Request, res: Response) => {
    const accomplishmentId = parseInt(req.params.accomplishmentId);
    await projectService.deleteAccomplishment(accomplishmentId);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Accomplishment deleted successfully"));
  }
);

/**
 * @desc    Get project documents
 * @route   GET /api/projects/:id/documents
 * @access  Private
 */
export const getProjectDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const documents = await projectService.getProjectDocuments(
      projectId,
      req.query
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          documents,
          "Project documents retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Upload project document
 * @route   POST /api/projects/:id/documents
 * @access  Private (Admin only)
 */
export const uploadProjectDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const document = await projectService.uploadProjectDocument(
      projectId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(201, document, "Document uploaded successfully"));
  }
);

/**
 * @desc    Get project timeline
 * @route   GET /api/projects/:id/timeline
 * @access  Private
 */
export const getProjectTimeline = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const timeline = await projectService.getProjectTimeline(projectId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          timeline,
          "Project timeline retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Create timeline event
 * @route   POST /api/projects/:id/timeline
 * @access  Private (Admin only)
 */
export const createTimelineEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const event = await projectService.createTimelineEvent(projectId, req.body);

    res
      .status(201)
      .json(new ApiResponse(201, event, "Timeline event created successfully"));
  }
);

/**
 * @desc    Update timeline event
 * @route   PUT /api/projects/:id/timeline/:timelineId
 * @access  Private (Admin only)
 */
export const updateTimelineEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const timelineId = parseInt(req.params.timelineId);
    const event = await projectService.updateTimelineEvent(
      timelineId,
      req.body
    );

    res
      .status(200)
      .json(new ApiResponse(200, event, "Timeline event updated successfully"));
  }
);

/**
 * @desc    Delete timeline event
 * @route   DELETE /api/projects/:id/timeline/:timelineId
 * @access  Private (Admin only)
 */
export const deleteTimelineEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const timelineId = parseInt(req.params.timelineId);
    await projectService.deleteTimelineEvent(timelineId);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Timeline event deleted successfully"));
  }
);
