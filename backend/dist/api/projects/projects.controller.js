"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimelineEvent = exports.updateTimelineEvent = exports.createTimelineEvent = exports.getProjectTimeline = exports.uploadProjectDocument = exports.getProjectDocuments = exports.deleteAccomplishment = exports.updateAccomplishment = exports.createAccomplishment = exports.getProjectAccomplishments = exports.updateProjectStatus = exports.deleteDocument = exports.updateDocument = exports.downloadDocument = exports.getAllDocuments = exports.getPublicDocuments = exports.getActiveProjects = exports.getProjectStats = exports.generateProjectReport = exports.updateProjectRaisedFunds = exports.deleteProjectUpdate = exports.updateProjectUpdate = exports.getProjectUpdates = exports.createProjectUpdate = exports.deleteExpense = exports.updateExpense = exports.getProjectExpenses = exports.recordExpense = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const projectService = __importStar(require("./projects.service"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Admin only)
 */
exports.createProject = (0, asyncHandler_1.default)(async (req, res) => {
    const data = {
        ...req.body,
        createdById: req.user?.id,
    };
    if (!data.createdById) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const project = await projectService.createProject(data);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, project, "Project created successfully"));
});
/**
 * @desc    Get projects with filtering
 * @route   GET /api/projects
 * @access  Private
 */
exports.getProjects = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        status: req.query.status,
        priority: req.query.priority,
        createdById: req.query.createdById
            ? parseInt(req.query.createdById)
            : undefined,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
        search: req.query.search,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
    };
    const result = await projectService.getProjects(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Projects retrieved successfully"));
});
/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
exports.getProjectById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await projectService.getProjectById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, project, "Project retrieved successfully"));
});
/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin only)
 */
exports.updateProject = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    const project = await projectService.updateProject(id, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, project, "Project updated successfully"));
});
/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
exports.deleteProject = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await projectService.deleteProject(id);
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Record an expense for a project
 * @route   POST /api/projects/:id/expenses
 * @access  Private (Admin only)
 */
exports.recordExpense = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const expenseData = {
        ...req.body,
        recordedBy: req.user?.id,
    };
    if (!expenseData.recordedBy) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const result = await projectService.recordExpense(projectId, expenseData);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, result, "Expense recorded successfully"));
});
/**
 * @desc    Get project expenses
 * @route   GET /api/projects/:id/expenses
 * @access  Private
 */
exports.getProjectExpenses = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const filters = {
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
        category: req.query.category,
    };
    const result = await projectService.getProjectExpenses(projectId, filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Project expenses retrieved successfully"));
});
/**
 * @desc    Update an expense
 * @route   PUT /api/projects/:id/expenses/:expenseId
 * @access  Private (Admin only)
 */
exports.updateExpense = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const expenseId = parseInt(req.params.expenseId);
    const data = req.body;
    const expense = await projectService.updateExpense(projectId, expenseId, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, expense, "Expense updated successfully"));
});
/**
 * @desc    Delete an expense
 * @route   DELETE /api/projects/:id/expenses/:expenseId
 * @access  Private (Admin only)
 */
exports.deleteExpense = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const expenseId = parseInt(req.params.expenseId);
    const result = await projectService.deleteExpense(projectId, expenseId);
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Create a project update/post
 * @route   POST /api/projects/:id/updates
 * @access  Private (Admin only)
 */
exports.createProjectUpdate = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const data = {
        ...req.body,
        postedBy: req.user?.id,
    };
    if (!data.postedBy) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const update = await projectService.createProjectUpdate(projectId, data);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, update, "Project update created successfully"));
});
/**
 * @desc    Get project updates
 * @route   GET /api/projects/:id/updates
 * @access  Private
 */
exports.getProjectUpdates = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const isPublic = req.query.isPublic === "true"
        ? true
        : req.query.isPublic === "false"
            ? false
            : undefined;
    const updates = await projectService.getProjectUpdates(projectId, isPublic);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, updates, "Project updates retrieved successfully"));
});
/**
 * @desc    Update a project update
 * @route   PUT /api/projects/:id/updates/:updateId
 * @access  Private (Admin only)
 */
exports.updateProjectUpdate = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);
    const data = req.body;
    const update = await projectService.updateProjectUpdate(projectId, updateId, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, update, "Project update updated successfully"));
});
/**
 * @desc    Delete a project update
 * @route   DELETE /api/projects/:id/updates/:updateId
 * @access  Private (Admin only)
 */
exports.deleteProjectUpdate = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);
    const result = await projectService.deleteProjectUpdate(projectId, updateId);
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Update project raised funds from contributions
 * @route   POST /api/projects/:id/update-raised
 * @access  Private (Admin only)
 */
exports.updateProjectRaisedFunds = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await projectService.updateProjectRaisedFunds(projectId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, project, "Project raised funds updated successfully"));
});
/**
 * @desc    Generate project report
 * @route   GET /api/projects/report
 * @access  Private (Admin only)
 */
exports.generateProjectReport = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        status: req.query.status,
        priority: req.query.priority,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        includeStats: req.query.includeStats === "false" ? false : true,
        includeExpenses: req.query.includeExpenses === "false" ? false : true,
        includeContributions: req.query.includeContributions === "false" ? false : true,
    };
    const report = await projectService.generateProjectReport(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, report, "Project report generated successfully"));
});
/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Private
 */
exports.getProjectStats = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        status: req.query.status,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
    };
    const stats = await projectService.getProjectStats(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Project statistics retrieved successfully"));
});
/**
 * @desc    Get active projects
 * @route   GET /api/projects/active
 * @access  Private
 */
exports.getActiveProjects = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        ...req.query,
        status: "ACTIVE",
    };
    const result = await projectService.getProjects(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Active projects retrieved successfully"));
});
/**
 * @desc    Get public documents from all projects
 * @route   GET /api/projects/documents/public
 * @access  Private
 */
exports.getPublicDocuments = (0, asyncHandler_1.default)(async (req, res) => {
    const documents = await projectService.getPublicDocuments(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, documents, "Public documents retrieved successfully"));
});
/**
 * @desc    Get all documents from all projects
 * @route   GET /api/projects/documents
 * @access  Private
 */
exports.getAllDocuments = (0, asyncHandler_1.default)(async (req, res) => {
    const documents = await projectService.getAllDocuments(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, documents, "All documents retrieved successfully"));
});
/**
 * @desc    Download a document
 * @route   GET /api/projects/documents/:documentId/download
 * @access  Private
 */
exports.downloadDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const documentId = parseInt(req.params.documentId);
    const document = await projectService.getDocumentForDownload(documentId);
    // In a real app, you would stream the file from storage
    res
        .status(200)
        .json(new ApiResponse_1.default(200, document, "Document download info retrieved"));
});
/**
 * @desc    Update a document
 * @route   PUT /api/projects/documents/:documentId
 * @access  Private (Admin only)
 */
exports.updateDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const documentId = parseInt(req.params.documentId);
    const document = await projectService.updateDocument(documentId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, document, "Document updated successfully"));
});
/**
 * @desc    Delete a document
 * @route   DELETE /api/projects/documents/:documentId
 * @access  Private (Admin only)
 */
exports.deleteDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const documentId = parseInt(req.params.documentId);
    await projectService.deleteDocument(documentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, null, "Document deleted successfully"));
});
/**
 * @desc    Update project status
 * @route   PATCH /api/projects/:id/status
 * @access  Private (Admin only)
 */
exports.updateProjectStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const { status } = req.body;
    const project = await projectService.updateProjectStatus(projectId, status);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, project, "Project status updated successfully"));
});
/**
 * @desc    Get project accomplishments
 * @route   GET /api/projects/:id/accomplishments
 * @access  Private
 */
exports.getProjectAccomplishments = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const accomplishments = await projectService.getProjectAccomplishments(projectId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, accomplishments, "Project accomplishments retrieved successfully"));
});
/**
 * @desc    Create accomplishment
 * @route   POST /api/projects/:id/accomplishments
 * @access  Private (Admin only)
 */
exports.createAccomplishment = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const accomplishment = await projectService.createAccomplishment(projectId, req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, accomplishment, "Accomplishment created successfully"));
});
/**
 * @desc    Update accomplishment
 * @route   PUT /api/projects/:id/accomplishments/:accomplishmentId
 * @access  Private (Admin only)
 */
exports.updateAccomplishment = (0, asyncHandler_1.default)(async (req, res) => {
    const accomplishmentId = parseInt(req.params.accomplishmentId);
    const accomplishment = await projectService.updateAccomplishment(accomplishmentId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, accomplishment, "Accomplishment updated successfully"));
});
/**
 * @desc    Delete accomplishment
 * @route   DELETE /api/projects/:id/accomplishments/:accomplishmentId
 * @access  Private (Admin only)
 */
exports.deleteAccomplishment = (0, asyncHandler_1.default)(async (req, res) => {
    const accomplishmentId = parseInt(req.params.accomplishmentId);
    await projectService.deleteAccomplishment(accomplishmentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, null, "Accomplishment deleted successfully"));
});
/**
 * @desc    Get project documents
 * @route   GET /api/projects/:id/documents
 * @access  Private
 */
exports.getProjectDocuments = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const documents = await projectService.getProjectDocuments(projectId, req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, documents, "Project documents retrieved successfully"));
});
/**
 * @desc    Upload project document
 * @route   POST /api/projects/:id/documents
 * @access  Private (Admin only)
 */
exports.uploadProjectDocument = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const document = await projectService.uploadProjectDocument(projectId, req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, document, "Document uploaded successfully"));
});
/**
 * @desc    Get project timeline
 * @route   GET /api/projects/:id/timeline
 * @access  Private
 */
exports.getProjectTimeline = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const timeline = await projectService.getProjectTimeline(projectId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, timeline, "Project timeline retrieved successfully"));
});
/**
 * @desc    Create timeline event
 * @route   POST /api/projects/:id/timeline
 * @access  Private (Admin only)
 */
exports.createTimelineEvent = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const event = await projectService.createTimelineEvent(projectId, req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, event, "Timeline event created successfully"));
});
/**
 * @desc    Update timeline event
 * @route   PUT /api/projects/:id/timeline/:timelineId
 * @access  Private (Admin only)
 */
exports.updateTimelineEvent = (0, asyncHandler_1.default)(async (req, res) => {
    const timelineId = parseInt(req.params.timelineId);
    const event = await projectService.updateTimelineEvent(timelineId, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, event, "Timeline event updated successfully"));
});
/**
 * @desc    Delete timeline event
 * @route   DELETE /api/projects/:id/timeline/:timelineId
 * @access  Private (Admin only)
 */
exports.deleteTimelineEvent = (0, asyncHandler_1.default)(async (req, res) => {
    const timelineId = parseInt(req.params.timelineId);
    await projectService.deleteTimelineEvent(timelineId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, null, "Timeline event deleted successfully"));
});
//# sourceMappingURL=projects.controller.js.map