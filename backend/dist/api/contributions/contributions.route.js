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
const contributionController = __importStar(require("./contributions.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const contributionValidation = __importStar(require("./contributions.validation"));
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Parent-specific routes (for logged-in parents)
router.get("/my-contributions", (0, validate_middleware_1.default)(contributionValidation.getContributionsSchema, "query"), contributionController.getMyContributions);
router.get("/my-balance", contributionController.getMyBalance);
// Payment basis and settings routes
router.get("/payment-basis", contributionController.getPaymentBasis);
router.get("/payment-basis-settings", contributionController.getPaymentBasisSettings);
router.put("/payment-basis", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.updatePaymentBasisSchema, "body"), contributionController.updatePaymentBasis);
// Reports routes (enhanced)
router.get("/reports/financial", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.contributionReportSchema, "query"), contributionController.generateFinancialReport);
router.get("/reports/financial/pdf", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.contributionReportSchema, "query"), contributionController.generateFinancialReportPDF);
router.get("/reports/financial/csv", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.contributionReportSchema, "query"), contributionController.generateFinancialReportCSV);
// Parent and project specific routes
router.get("/parent/:parentId", (0, validate_middleware_1.default)(contributionValidation.getContributionsSchema, "query"), contributionController.getContributionsByParent);
router.get("/project/:projectId", (0, validate_middleware_1.default)(contributionValidation.getContributionsSchema, "query"), contributionController.getContributionsByProject);
// Get statistics (all users can view)
router.get("/stats", (0, validate_middleware_1.default)(contributionValidation.contributionStatsSchema, "query"), contributionController.getContributionStats);
// Generate report (admin only) - keeping for backward compatibility
router.get("/report", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.contributionReportSchema, "query"), contributionController.generateContributionReport);
// Update overdue status (admin only)
router.post("/update-overdue", (0, auth_middleware_1.authorize)("ADMIN"), contributionController.updateOverdueStatus);
// Get all contributions with filters (all users)
router.get("/", (0, validate_middleware_1.default)(contributionValidation.getContributionsSchema, "query"), contributionController.getContributions);
// Create new contribution (admin only)
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.createContributionSchema, "body"), contributionController.createContribution);
// Get contribution by ID (all users)
router.get("/:id", contributionController.getContributionById);
// Update contribution (admin only)
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.updateContributionSchema, "body"), contributionController.updateContribution);
// Delete contribution (admin only)
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), contributionController.deleteContribution);
// Record payment for contribution (admin only)
router.post("/:id/payment", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.recordPaymentSchema, "body"), contributionController.recordPayment);
// Waive contribution (admin only)
router.post("/:id/waive", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.waiveContributionSchema, "body"), contributionController.waiveContribution);
// Verify contribution payment (admin only)
router.post("/:id/verify", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(contributionValidation.verifyPaymentSchema, "body"), contributionController.verifyPayment);
exports.default = router;
//# sourceMappingURL=contributions.route.js.map