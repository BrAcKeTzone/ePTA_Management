import { Router } from "express";
import * as officerController from "./officers.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Get all officers (accessible by both admin and parent)
router.get("/", authenticate, officerController.getAllOfficers);

// Assign officer (admin only)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  officerController.assignOfficer
);

// Remove officer (admin only)
router.delete(
  "/:position",
  authenticate,
  authorize("ADMIN"),
  officerController.removeOfficer
);

export default router;
