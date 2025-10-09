import express from "express";
import * as contributionController from "./contributions.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import * as contributionValidation from "./contributions.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Parent-specific routes (for logged-in parents)
router.get(
  "/my-contributions",
  validate(contributionValidation.getContributionsSchema, "query"),
  contributionController.getMyContributions
);

router.get("/my-balance", contributionController.getMyBalance);

// Payment basis and settings routes
router.get("/payment-basis", contributionController.getPaymentBasis);

router.get(
  "/payment-basis-settings",
  contributionController.getPaymentBasisSettings
);

router.put(
  "/payment-basis",
  authorize("ADMIN"),
  validate(contributionValidation.updatePaymentBasisSchema, "body"),
  contributionController.updatePaymentBasis
);

// Reports routes (enhanced)
router.get(
  "/reports/financial",
  authorize("ADMIN"),
  validate(contributionValidation.contributionReportSchema, "query"),
  contributionController.generateFinancialReport
);

router.get(
  "/reports/financial/pdf",
  authorize("ADMIN"),
  validate(contributionValidation.contributionReportSchema, "query"),
  contributionController.generateFinancialReportPDF
);

router.get(
  "/reports/financial/csv",
  authorize("ADMIN"),
  validate(contributionValidation.contributionReportSchema, "query"),
  contributionController.generateFinancialReportCSV
);

// Parent and project specific routes
router.get(
  "/parent/:parentId",
  validate(contributionValidation.getContributionsSchema, "query"),
  contributionController.getContributionsByParent
);

router.get(
  "/project/:projectId",
  validate(contributionValidation.getContributionsSchema, "query"),
  contributionController.getContributionsByProject
);

// Get statistics (all users can view)
router.get(
  "/stats",
  validate(contributionValidation.contributionStatsSchema, "query"),
  contributionController.getContributionStats
);

// Generate report (admin only) - keeping for backward compatibility
router.get(
  "/report",
  authorize("ADMIN"),
  validate(contributionValidation.contributionReportSchema, "query"),
  contributionController.generateContributionReport
);

// Update overdue status (admin only)
router.post(
  "/update-overdue",
  authorize("ADMIN"),
  contributionController.updateOverdueStatus
);

// Get all contributions with filters (all users)
router.get(
  "/",
  validate(contributionValidation.getContributionsSchema, "query"),
  contributionController.getContributions
);

// Create new contribution (admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(contributionValidation.createContributionSchema, "body"),
  contributionController.createContribution
);

// Get contribution by ID (all users)
router.get("/:id", contributionController.getContributionById);

// Update contribution (admin only)
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(contributionValidation.updateContributionSchema, "body"),
  contributionController.updateContribution
);

// Delete contribution (admin only)
router.delete(
  "/:id",
  authorize("ADMIN"),
  contributionController.deleteContribution
);

// Record payment for contribution (admin only)
router.post(
  "/:id/payment",
  authorize("ADMIN"),
  validate(contributionValidation.recordPaymentSchema, "body"),
  contributionController.recordPayment
);

// Waive contribution (admin only)
router.post(
  "/:id/waive",
  authorize("ADMIN"),
  validate(contributionValidation.waiveContributionSchema, "body"),
  contributionController.waiveContribution
);

// Verify contribution payment (admin only)
router.post(
  "/:id/verify",
  authorize("ADMIN"),
  validate(contributionValidation.verifyPaymentSchema, "body"),
  contributionController.verifyPayment
);

export default router;
