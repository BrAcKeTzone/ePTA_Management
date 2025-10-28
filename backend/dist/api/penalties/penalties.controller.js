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
exports.getPenaltyStats = exports.generatePenaltyReport = exports.updateOverdueStatus = exports.waivePenalty = exports.recordPayment = exports.deletePenalty = exports.updatePenalty = exports.getPenaltyById = exports.getPenalties = exports.createPenalty = void 0;
const penaltyService = __importStar(require("./penalties.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
/**
 * @desc    Create a new penalty
 * @route   POST /api/penalties
 * @access  Private/Admin
 */
exports.createPenalty = (0, asyncHandler_1.default)(async (req, res) => {
    const penalty = await penaltyService.createPenalty(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, penalty, "Penalty created successfully"));
});
/**
 * @desc    Get penalties with filters
 * @route   GET /api/penalties
 * @access  Private
 */
exports.getPenalties = (0, asyncHandler_1.default)(async (req, res) => {
    // Convert query params to appropriate types
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        paymentStatus: req.query.paymentStatus,
        isPaid: req.query.isPaid === "true"
            ? true
            : req.query.isPaid === "false"
                ? false
                : undefined,
        isOverdue: req.query.isOverdue === "true"
            ? true
            : req.query.isOverdue === "false"
                ? false
                : undefined,
        isWaived: req.query.isWaived === "true"
            ? true
            : req.query.isWaived === "false"
                ? false
                : undefined,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
    };
    const result = await penaltyService.getPenalties(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Penalties retrieved successfully"));
});
/**
 * @desc    Get penalty by ID
 * @route   GET /api/penalties/:id
 * @access  Private
 */
exports.getPenaltyById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const penalty = await penaltyService.getPenaltyById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, penalty, "Penalty retrieved successfully"));
});
/**
 * @desc    Update penalty
 * @route   PUT /api/penalties/:id
 * @access  Private/Admin
 */
exports.updatePenalty = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const penalty = await penaltyService.updatePenalty(id, req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, penalty, "Penalty updated successfully"));
});
/**
 * @desc    Delete penalty
 * @route   DELETE /api/penalties/:id
 * @access  Private/Admin
 */
exports.deletePenalty = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await penaltyService.deletePenalty(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Penalty deleted successfully"));
});
/**
 * @desc    Record a payment for a penalty
 * @route   POST /api/penalties/:id/payment
 * @access  Private/Admin
 */
exports.recordPayment = (0, asyncHandler_1.default)(async (req, res) => {
    const penaltyId = parseInt(req.params.id);
    const recordedById = req.user?.id;
    if (!recordedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const result = await penaltyService.recordPayment(penaltyId, req.body, recordedById);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, result, "Payment recorded successfully"));
});
/**
 * @desc    Waive a penalty
 * @route   POST /api/penalties/:id/waive
 * @access  Private/Admin
 */
exports.waivePenalty = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const waivedBy = req.user?.id;
    if (!waivedBy) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const penalty = await penaltyService.waivePenalty(id, req.body.waiverReason, waivedBy);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, penalty, "Penalty waived successfully"));
});
/**
 * @desc    Update overdue penalties status
 * @route   POST /api/penalties/update-overdue
 * @access  Private/Admin
 */
exports.updateOverdueStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await penaltyService.updateOverdueStatus();
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Generate penalty report
 * @route   GET /api/penalties/report
 * @access  Private/Admin
 */
exports.generatePenaltyReport = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        paymentStatus: req.query.paymentStatus,
        dateFrom: new Date(req.query.dateFrom),
        dateTo: new Date(req.query.dateTo),
        includeStats: req.query.includeStats === "false" ? false : true,
        groupBy: req.query.groupBy,
    };
    const report = await penaltyService.generatePenaltyReport(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, report, "Penalty report generated successfully"));
});
/**
 * @desc    Get penalty statistics
 * @route   GET /api/penalties/stats
 * @access  Private
 */
exports.getPenaltyStats = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        meetingId: req.query.meetingId
            ? parseInt(req.query.meetingId)
            : undefined,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
    };
    const stats = await penaltyService.getPenaltyStats(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Penalty statistics retrieved successfully"));
});
//# sourceMappingURL=penalties.controller.js.map