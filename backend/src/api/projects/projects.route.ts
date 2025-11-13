import express from "express";
import * as projectController from "./projects.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as projectValidation from "./projects.validation";
import upload from "../../middlewares/upload.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Special routes (before parameterized routes)
router.get(
  "/active",
  validate(projectValidation.getProjectsSchema, "query"),
  projectController.getActiveProjects
);

router.get(
  "/documents/public",
  validate(projectValidation.getProjectsSchema, "query"),
  projectController.getPublicDocuments
);

// Document management routes
router.get("/documents", projectController.getAllDocuments);

router.get(
  "/documents/:documentId/download",
  projectController.downloadDocument
);

router.put(
  "/documents/:documentId",
  authorize("ADMIN"),
  projectController.updateDocument
);

router.delete(
  "/documents/:documentId",
  authorize("ADMIN"),
  projectController.deleteDocument
);

// Get statistics (all users can view)
router.get(
  "/stats",
  validate(projectValidation.projectStatsSchema, "query"),
  projectController.getProjectStats
);

// Generate report (admin only)
router.get(
  "/report",
  authorize("ADMIN"),
  validate(projectValidation.projectReportSchema, "query"),
  projectController.generateProjectReport
);

// Get all projects with filters (all users)
router.get(
  "/",
  validate(projectValidation.getProjectsSchema, "query"),
  projectController.getProjects
);

// Create new project (admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(projectValidation.createProjectSchema, "body"),
  projectController.createProject
);

// Get project by ID (all users)
router.get("/:id", projectController.getProjectById);

// Update project (admin only)
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(projectValidation.updateProjectSchema, "body"),
  projectController.updateProject
);

// Upload completion images (admin only)
router.post(
  "/:id/completion-images",
  authorize("ADMIN"),
  upload.array("images", 10),
  projectController.uploadCompletionImages
);

// Delete completion image (admin only)
router.delete(
  "/:id/completion-images",
  authorize("ADMIN"),
  projectController.deleteCompletionImage
);

// Update project status (admin only)
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  projectController.updateProjectStatus
);

// Delete project (admin only)
router.delete("/:id", authorize("ADMIN"), projectController.deleteProject);

// Project accomplishments routes
router.get("/:id/accomplishments", projectController.getProjectAccomplishments);

router.post(
  "/:id/accomplishments",
  authorize("ADMIN"),
  projectController.createAccomplishment
);

router.put(
  "/:id/accomplishments/:accomplishmentId",
  authorize("ADMIN"),
  projectController.updateAccomplishment
);

router.delete(
  "/:id/accomplishments/:accomplishmentId",
  authorize("ADMIN"),
  projectController.deleteAccomplishment
);

// Project documents routes (project-specific)
router.get("/:id/documents", projectController.getProjectDocuments);

router.post(
  "/:id/documents",
  authorize("ADMIN"),
  projectController.uploadProjectDocument
);

// Project timeline routes
router.get("/:id/timeline", projectController.getProjectTimeline);

router.post(
  "/:id/timeline",
  authorize("ADMIN"),
  projectController.createTimelineEvent
);

router.put(
  "/:id/timeline/:timelineId",
  authorize("ADMIN"),
  projectController.updateTimelineEvent
);

router.delete(
  "/:id/timeline/:timelineId",
  authorize("ADMIN"),
  projectController.deleteTimelineEvent
);

// Update raised funds from contributions (admin only)
router.post(
  "/:id/update-raised",
  authorize("ADMIN"),
  projectController.updateProjectRaisedFunds
);

// Project expenses routes
router.get("/:id/expenses", projectController.getProjectExpenses);

router.post(
  "/:id/expenses",
  authorize("ADMIN"),
  validate(projectValidation.recordExpenseSchema, "body"),
  projectController.recordExpense
);

router.put(
  "/:id/expenses/:expenseId",
  authorize("ADMIN"),
  validate(projectValidation.updateExpenseSchema, "body"),
  projectController.updateExpense
);

router.delete(
  "/:id/expenses/:expenseId",
  authorize("ADMIN"),
  projectController.deleteExpense
);

// Project updates routes
router.get("/:id/updates", projectController.getProjectUpdates);

router.post(
  "/:id/updates",
  authorize("ADMIN"),
  validate(projectValidation.createProjectUpdateSchema, "body"),
  projectController.createProjectUpdate
);

router.put(
  "/:id/updates/:updateId",
  authorize("ADMIN"),
  validate(projectValidation.updateProjectUpdateSchema, "body"),
  projectController.updateProjectUpdate
);

router.delete(
  "/:id/updates/:updateId",
  authorize("ADMIN"),
  projectController.deleteProjectUpdate
);

export default router;
