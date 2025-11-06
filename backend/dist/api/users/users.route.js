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
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("./users.controller"));
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const userValidation = __importStar(require("./users.validation"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
// User profile routes (self-service) - require authentication
router.get("/me", auth_middleware_1.authenticate, userController.getUserProfile);
router.get("/profile", auth_middleware_1.authenticate, userController.getUserProfile);
router.put("/me", auth_middleware_1.authenticate, (0, validate_middleware_1.default)(userValidation.updateUserProfile), userController.updateUserProfile);
router.put("/profile", auth_middleware_1.authenticate, (0, validate_middleware_1.default)(userValidation.updateUserProfile), userController.updateUserProfile);
router.post("/change-password", auth_middleware_1.authenticate, (0, validate_middleware_1.default)(userValidation.changePassword), userController.changePassword);
// Admin routes for user management
router.post("/", (0, validate_middleware_1.default)(userValidation.createUser), userController.createUser);
router.get("/", (0, validate_middleware_1.default)(userValidation.getUsers), userController.getAllUsers);
router.get("/stats", userController.getUserStats);
router.get("/:id", userController.getUserById);
router.put("/:id", (0, validate_middleware_1.default)(userValidation.updateUserByAdmin), userController.updateUserByAdmin);
router.delete("/:id", userController.deleteUser);
router.patch("/:id/role", (0, validate_middleware_1.default)(userValidation.updateUserRole), userController.updateUserRole);
router.patch("/:id/deactivate", userController.deactivateUser);
router.patch("/:id/activate", userController.activateUser);
exports.default = router;
//# sourceMappingURL=users.route.js.map