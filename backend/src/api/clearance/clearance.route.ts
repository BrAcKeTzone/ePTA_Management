import express from "express";
import * as clearanceController from "./clearance.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  searchParentStudentSchema,
  verifyClearanceSchema,
  clearanceDetailsSchema,
  requestClearanceSchema,
  clearanceRequestParamsSchema,
  rejectClearanceSchema,
  clearanceStatsSchema,
  clearanceIdParam,
  bulkVerifySchema,
} from "./clearance.validation";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin routes
router.get(
  "/search",
  authorize("ADMIN"),
  validate(searchParentStudentSchema, "query"),
  clearanceController.searchParentStudent
);

router.get(
  "/verify",
  authorize("ADMIN"),
  validate(verifyClearanceSchema, "query"),
  clearanceController.verifyClearance
);

router.get(
  "/details",
  authorize("ADMIN"),
  validate(clearanceDetailsSchema, "query"),
  clearanceController.getClearanceDetails
);

router.get(
  "/certificate",
  authorize("ADMIN"),
  validate(clearanceDetailsSchema, "query"),
  clearanceController.generateClearanceCertificate
);

router.get(
  "/requests",
  authorize("ADMIN"),
  validate(clearanceRequestParamsSchema, "query"),
  clearanceController.getAllClearanceRequests
);

router.patch(
  "/requests/:id/approve",
  authorize("ADMIN"),
  validate(clearanceIdParam, "params"),
  clearanceController.approveClearanceRequest
);

router.patch(
  "/requests/:id/reject",
  authorize("ADMIN"),
  validate(clearanceIdParam, "params"),
  validate(rejectClearanceSchema, "body"),
  clearanceController.rejectClearanceRequest
);

router.get(
  "/statistics",
  authorize("ADMIN"),
  validate(clearanceStatsSchema, "query"),
  clearanceController.getClearanceStatistics
);

router.post(
  "/bulk-verify",
  authorize("ADMIN"),
  validate(bulkVerifySchema, "body"),
  clearanceController.bulkVerifyClearance
);

router.get(
  "/reports/export",
  authorize("ADMIN"),
  validate(clearanceRequestParamsSchema, "query"),
  clearanceController.exportClearanceReport
);

// Parent routes
router.get("/my-status", clearanceController.getMyClearanceStatus);

router.post(
  "/request",
  validate(requestClearanceSchema, "body"),
  clearanceController.requestClearance
);

router.get(
  "/my-requests",
  validate(clearanceRequestParamsSchema, "query"),
  clearanceController.getMyClearanceRequests
);

router.get(
  "/my-requests/:id/download",
  validate(clearanceIdParam, "params"),
  clearanceController.downloadMyClearance
);

// Shared routes
router.get("/requirements", clearanceController.getClearanceRequirements);

export default router;
