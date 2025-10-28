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
const penaltyController = __importStar(require("./penalties.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const penalties_validation_1 = require("./penalties.validation");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Statistics route (must be before /:id route)
router.get("/stats", (0, validate_middleware_1.default)(penalties_validation_1.penaltyStatsSchema, "query"), penaltyController.getPenaltyStats);
// Report route (must be before /:id route)
router.get("/report", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(penalties_validation_1.penaltyReportSchema, "query"), penaltyController.generatePenaltyReport);
// Update overdue status (admin only)
router.post("/update-overdue", (0, auth_middleware_1.authorize)("ADMIN"), penaltyController.updateOverdueStatus);
// Get all penalties with filters
router.get("/", (0, validate_middleware_1.default)(penalties_validation_1.getPenaltiesSchema, "query"), penaltyController.getPenalties);
// Create penalty (admin only)
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(penalties_validation_1.createPenaltySchema, "body"), penaltyController.createPenalty);
// Get penalty by ID
router.get("/:id", penaltyController.getPenaltyById);
// Update penalty (admin only)
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(penalties_validation_1.updatePenaltySchema, "body"), penaltyController.updatePenalty);
// Delete penalty (admin only)
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), penaltyController.deletePenalty);
// Record payment for penalty (admin only)
router.post("/:id/payment", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(penalties_validation_1.recordPaymentSchema, "body"), penaltyController.recordPayment);
// Waive penalty (admin only)
router.post("/:id/waive", (0, auth_middleware_1.authorize)("ADMIN"), (0, validate_middleware_1.default)(penalties_validation_1.waivePenaltySchema, "body"), penaltyController.waivePenalty);
exports.default = router;
//# sourceMappingURL=penalties.route.js.map