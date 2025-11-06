import express from "express";
import * as userController from "./users.controller";
import validate from "../../middlewares/validate.middleware";
import * as userValidation from "./users.validation";
import { authenticate } from "../../middlewares/auth.middleware";

const router = express.Router();

// User profile routes (self-service) - require authentication
router.get("/me", authenticate, userController.getUserProfile);

router.get("/profile", authenticate, userController.getUserProfile);

router.put(
  "/me",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);

router.put(
  "/profile",
  authenticate,
  validate(userValidation.updateUserProfile),
  userController.updateUserProfile
);

router.post(
  "/change-password",
  authenticate,
  validate(userValidation.changePassword),
  userController.changePassword
);

// Admin routes for user management
router.get("/", validate(userValidation.getUsers), userController.getAllUsers);

router.get("/stats", userController.getUserStats);

router.get("/:id", userController.getUserById);

router.put(
  "/:id",
  validate(userValidation.updateUserByAdmin),
  userController.updateUserByAdmin
);

router.delete("/:id", userController.deleteUser);

router.patch(
  "/:id/role",
  validate(userValidation.updateUserRole),
  userController.updateUserRole
);

router.patch("/:id/deactivate", userController.deactivateUser);

router.patch("/:id/activate", userController.activateUser);

export default router;
