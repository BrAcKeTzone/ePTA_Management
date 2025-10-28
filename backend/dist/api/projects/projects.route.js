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
const projectController = __importStar(require("./projects.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const projectValidation = __importStar(require("./projects.validation"));
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Special routes (before parameterized routes)
router.get("/active", (0, validate_middleware_1.default)(projectValidation.getProjectsSchema, "query"), projectController.getActiveProjects);
router.get("/documents/public", (0, validate_middleware_1.default)(projectValidation.getProjectsSchema, "query"), projectController.getPublicDocuments);
// Document management routes
router.get("/documents", projectController.getAllDocuments);
router.get("/documents/:documentId/download", projectController.downloadDocument);
router.put("/documents/:documentId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.updateDocument);
router.delete("/documents/:documentId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteDocument);
// Get statistics (all users can view)
router.get("/stats", (0, validate_middleware_1.default)(projectValidation.projectStatsSchema, "query"), projectController.getProjectStats);
// Generate report (admin only)
router.get("/report", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.projectReportSchema, "query"), projectController.generateProjectReport);
// Get all projects with filters (all users)
router.get("/", (0, validate_middleware_1.default)(projectValidation.getProjectsSchema, "query"), projectController.getProjects);
// Create new project (admin only)
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.createProjectSchema, "body"), projectController.createProject);
// Get project by ID (all users)
router.get("/:id", projectController.getProjectById);
// Update project (admin only)
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.updateProjectSchema, "body"), projectController.updateProject);
// Update project status (admin only)
router.patch("/:id/status", (0, auth_middleware_1.authorize)("ADMIN"), projectController.updateProjectStatus);
// Delete project (admin only)
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteProject);
// Project accomplishments routes
router.get("/:id/accomplishments", projectController.getProjectAccomplishments);
router.post("/:id/accomplishments", (0, auth_middleware_1.authorize)("ADMIN"), projectController.createAccomplishment);
router.put("/:id/accomplishments/:accomplishmentId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.updateAccomplishment);
router.delete("/:id/accomplishments/:accomplishmentId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteAccomplishment);
// Project documents routes (project-specific)
router.get("/:id/documents", projectController.getProjectDocuments);
router.post("/:id/documents", (0, auth_middleware_1.authorize)("ADMIN"), projectController.uploadProjectDocument);
// Project timeline routes
router.get("/:id/timeline", projectController.getProjectTimeline);
router.post("/:id/timeline", (0, auth_middleware_1.authorize)("ADMIN"), projectController.createTimelineEvent);
router.put("/:id/timeline/:timelineId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.updateTimelineEvent);
router.delete("/:id/timeline/:timelineId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteTimelineEvent);
// Update raised funds from contributions (admin only)
router.post("/:id/update-raised", (0, auth_middleware_1.authorize)("ADMIN"), projectController.updateProjectRaisedFunds);
// Project expenses routes
router.get("/:id/expenses", projectController.getProjectExpenses);
router.post("/:id/expenses", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.recordExpenseSchema, "body"), projectController.recordExpense);
router.put("/:id/expenses/:expenseId", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.updateExpenseSchema, "body"), projectController.updateExpense);
router.delete("/:id/expenses/:expenseId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteExpense);
// Project updates routes
router.get("/:id/updates", projectController.getProjectUpdates);
router.post("/:id/updates", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.createProjectUpdateSchema, "body"), projectController.createProjectUpdate);
router.put("/:id/updates/:updateId", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(projectValidation.updateProjectUpdateSchema, "body"), projectController.updateProjectUpdate);
router.delete("/:id/updates/:updateId", (0, auth_middleware_1.authorize)("ADMIN"), projectController.deleteProjectUpdate);
exports.default = router;
//# sourceMappingURL=projects.route.js.map