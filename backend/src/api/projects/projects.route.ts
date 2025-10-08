import express from "express";
import * as projectController from "./projects.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as projectValidation from "./projects.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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

// Delete project (admin only)
router.delete("/:id", authorize("ADMIN"), projectController.deleteProject);

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
