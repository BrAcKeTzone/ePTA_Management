import express from "express";
import * as penaltyController from "./penalties.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  createPenaltySchema,
  recordPaymentSchema,
  updatePenaltySchema,
  waivePenaltySchema,
  getPenaltiesSchema,
  penaltyReportSchema,
  penaltyStatsSchema,
} from "./penalties.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Statistics route (must be before /:id route)
router.get(
  "/stats",
  validate(penaltyStatsSchema, "query"),
  penaltyController.getPenaltyStats
);

// Report route (must be before /:id route)
router.get(
  "/report",
  authorize("ADMIN"),
  validate(penaltyReportSchema, "query"),
  penaltyController.generatePenaltyReport
);

// Update overdue status (admin only)
router.post(
  "/update-overdue",
  authorize("ADMIN"),
  penaltyController.updateOverdueStatus
);

// Get all penalties with filters
router.get(
  "/",
  validate(getPenaltiesSchema, "query"),
  penaltyController.getPenalties
);

// Create penalty (admin only)
router.post(
  "/",
  authorize("ADMIN"),
  validate(createPenaltySchema, "body"),
  penaltyController.createPenalty
);

// Get penalty by ID
router.get("/:id", penaltyController.getPenaltyById);

// Update penalty (admin only)
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updatePenaltySchema, "body"),
  penaltyController.updatePenalty
);

// Delete penalty (admin only)
router.delete("/:id", authorize("ADMIN"), penaltyController.deletePenalty);

// Record payment for penalty (admin only)
router.post(
  "/:id/payment",
  authorize("ADMIN"),
  validate(recordPaymentSchema, "body"),
  penaltyController.recordPayment
);

// Waive penalty (admin only)
router.post(
  "/:id/waive",
  authorize("ADMIN"),
  validate(waivePenaltySchema, "body"),
  penaltyController.waivePenalty
);

export default router;
