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
exports.generateFinancialReportCSV = exports.generateFinancialReportPDF = exports.generateFinancialReport = exports.verifyPayment = exports.getContributionsByProject = exports.getContributionsByParent = exports.updatePaymentBasis = exports.getPaymentBasisSettings = exports.getPaymentBasis = exports.getMyBalance = exports.getMyContributions = exports.getContributionStats = exports.generateContributionReport = exports.updateOverdueStatus = exports.waiveContribution = exports.recordPayment = exports.deleteContribution = exports.updateContribution = exports.getContributionById = exports.getContributions = exports.createContribution = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const contributionService = __importStar(require("./contributions.service"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
/**
 * @desc    Create a new contribution
 * @route   POST /api/contributions
 * @access  Private (Admin only)
 */
exports.createContribution = (0, asyncHandler_1.default)(async (req, res) => {
    const data = req.body;
    const contribution = await contributionService.createContribution(data);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, contribution, "Contribution created successfully"));
});
/**
 * @desc    Get contributions with filtering
 * @route   GET /api/contributions
 * @access  Private
 */
exports.getContributions = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        status: req.query.status,
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
        academicYear: req.query.academicYear,
        period: req.query.period,
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
    const result = await contributionService.getContributions(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Contributions retrieved successfully"));
});
/**
 * @desc    Get contribution by ID
 * @route   GET /api/contributions/:id
 * @access  Private
 */
exports.getContributionById = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const contribution = await contributionService.getContributionById(id);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, contribution, "Contribution retrieved successfully"));
});
/**
 * @desc    Update contribution
 * @route   PUT /api/contributions/:id
 * @access  Private (Admin only)
 */
exports.updateContribution = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    const contribution = await contributionService.updateContribution(id, data);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, contribution, "Contribution updated successfully"));
});
/**
 * @desc    Delete contribution
 * @route   DELETE /api/contributions/:id
 * @access  Private (Admin only)
 */
exports.deleteContribution = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await contributionService.deleteContribution(id);
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Record a payment for a contribution
 * @route   POST /api/contributions/:id/payment
 * @access  Private (Admin only)
 */
exports.recordPayment = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const paymentData = {
        ...req.body,
        recordedBy: req.user?.id, // From auth middleware
    };
    if (!paymentData.recordedBy) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const result = await contributionService.recordPayment(id, paymentData);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, result, "Payment recorded successfully"));
});
/**
 * @desc    Waive a contribution
 * @route   POST /api/contributions/:id/waive
 * @access  Private (Admin only)
 */
exports.waiveContribution = (0, asyncHandler_1.default)(async (req, res) => {
    const id = parseInt(req.params.id);
    const { waiverReason } = req.body;
    const waivedBy = req.user?.id;
    if (!waivedBy) {
        throw new ApiError_1.default(401, "User not authenticated");
    }
    const contribution = await contributionService.waiveContribution(id, waiverReason, waivedBy);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, contribution, "Contribution waived successfully"));
});
/**
 * @desc    Update overdue status for contributions
 * @route   POST /api/contributions/update-overdue
 * @access  Private (Admin only)
 */
exports.updateOverdueStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await contributionService.updateOverdueStatus();
    res.status(200).json(new ApiResponse_1.default(200, result, result.message));
});
/**
 * @desc    Generate contribution report
 * @route   GET /api/contributions/report
 * @access  Private (Admin only)
 */
exports.generateContributionReport = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        status: req.query.status,
        academicYear: req.query.academicYear,
        period: req.query.period,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        includeStats: req.query.includeStats === "false" ? false : true,
        groupBy: req.query.groupBy,
    };
    const report = await contributionService.generateContributionReport(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, report, "Contribution report generated successfully"));
});
/**
 * @desc    Get contribution statistics
 * @route   GET /api/contributions/stats
 * @access  Private
 */
exports.getContributionStats = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        academicYear: req.query.academicYear,
        period: req.query.period,
        dateFrom: req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined,
        dateTo: req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined,
    };
    const stats = await contributionService.getContributionStats(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Contribution statistics retrieved successfully"));
});
/**
 * @desc    Get current user's contributions
 * @route   GET /api/contributions/my-contributions
 * @access  Private
 */
exports.getMyContributions = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const filters = {
        parentId: userId,
        ...req.query,
    };
    const result = await contributionService.getContributions(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Your contributions retrieved successfully"));
});
/**
 * @desc    Get current user's balance summary
 * @route   GET /api/contributions/my-balance
 * @access  Private
 */
exports.getMyBalance = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const balance = await contributionService.getUserBalance(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, balance, "Balance information retrieved successfully"));
});
/**
 * @desc    Get payment basis settings
 * @route   GET /api/contributions/payment-basis
 * @access  Private
 */
exports.getPaymentBasis = (0, asyncHandler_1.default)(async (req, res) => {
    const settings = await contributionService.getPaymentBasisSettings();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, settings, "Payment basis settings retrieved successfully"));
});
/**
 * @desc    Get detailed payment basis settings
 * @route   GET /api/contributions/payment-basis-settings
 * @access  Private
 */
exports.getPaymentBasisSettings = (0, asyncHandler_1.default)(async (req, res) => {
    const settings = await contributionService.getDetailedPaymentBasisSettings();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, settings, "Detailed payment basis settings retrieved successfully"));
});
/**
 * @desc    Update payment basis settings
 * @route   PUT /api/contributions/payment-basis
 * @access  Private (Admin only)
 */
exports.updatePaymentBasis = (0, asyncHandler_1.default)(async (req, res) => {
    const settings = await contributionService.updatePaymentBasisSettings(req.body);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, settings, "Payment basis settings updated successfully"));
});
/**
 * @desc    Get contributions by parent
 * @route   GET /api/contributions/parent/:parentId
 * @access  Private
 */
exports.getContributionsByParent = (0, asyncHandler_1.default)(async (req, res) => {
    const parentId = parseInt(req.params.parentId);
    const filters = {
        parentId,
        ...req.query,
    };
    const result = await contributionService.getContributions(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Parent contributions retrieved successfully"));
});
/**
 * @desc    Get contributions by project
 * @route   GET /api/contributions/project/:projectId
 * @access  Private
 */
exports.getContributionsByProject = (0, asyncHandler_1.default)(async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const filters = {
        projectId,
        ...req.query,
    };
    const result = await contributionService.getContributions(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Project contributions retrieved successfully"));
});
/**
 * @desc    Verify contribution payment
 * @route   POST /api/contributions/:id/verify
 * @access  Private (Admin only)
 */
exports.verifyPayment = (0, asyncHandler_1.default)(async (req, res) => {
    const contributionId = parseInt(req.params.id);
    const { verified, notes } = req.body;
    const contribution = await contributionService.verifyContributionPayment(contributionId, verified, notes);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, contribution, "Payment verification updated successfully"));
});
/**
 * @desc    Generate financial report
 * @route   GET /api/contributions/reports/financial
 * @access  Private (Admin only)
 */
exports.generateFinancialReport = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        status: req.query.status,
        academicYear: req.query.academicYear,
        period: req.query.period,
        dateFrom: new Date(req.query.dateFrom),
        dateTo: new Date(req.query.dateTo),
        includeStats: req.query.includeStats === "true",
        groupBy: req.query.groupBy,
    };
    const report = await contributionService.generateFinancialReport(filters);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, report, "Financial report generated successfully"));
});
/**
 * @desc    Generate financial report PDF
 * @route   GET /api/contributions/reports/financial/pdf
 * @access  Private (Admin only)
 */
exports.generateFinancialReportPDF = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        status: req.query.status,
        academicYear: req.query.academicYear,
        period: req.query.period,
        dateFrom: new Date(req.query.dateFrom),
        dateTo: new Date(req.query.dateTo),
    };
    const pdfBuffer = await contributionService.generateFinancialReportPDF(filters);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="financial-report.pdf"');
    res.send(pdfBuffer);
});
/**
 * @desc    Generate financial report CSV
 * @route   GET /api/contributions/reports/financial/csv
 * @access  Private (Admin only)
 */
exports.generateFinancialReportCSV = (0, asyncHandler_1.default)(async (req, res) => {
    const filters = {
        parentId: req.query.parentId
            ? parseInt(req.query.parentId)
            : undefined,
        projectId: req.query.projectId
            ? parseInt(req.query.projectId)
            : undefined,
        type: req.query.type,
        status: req.query.status,
        academicYear: req.query.academicYear,
        period: req.query.period,
        dateFrom: new Date(req.query.dateFrom),
        dateTo: new Date(req.query.dateTo),
    };
    const csvData = await contributionService.generateFinancialReportCSV(filters);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="financial-report.csv"');
    res.send(csvData);
});
//# sourceMappingURL=contributions.controller.js.map