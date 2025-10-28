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
exports.exportClearanceReport = exports.bulkVerifyClearance = exports.getClearanceStatistics = exports.getClearanceRequirements = exports.downloadMyClearance = exports.getMyClearanceRequests = exports.requestClearance = exports.getMyClearanceStatus = exports.rejectClearanceRequest = exports.approveClearanceRequest = exports.getAllClearanceRequests = exports.generateClearanceCertificate = exports.getClearanceDetails = exports.verifyClearance = exports.searchParentStudent = void 0;
const clearanceService = __importStar(require("./clearance.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
/**
 * @desc    Search for parent and student information
 * @route   GET /api/clearance/search
 * @access  Private/Admin
 */
exports.searchParentStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { q } = req.query;
    const results = await clearanceService.searchParentStudent(q);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, results, "Search completed successfully"));
});
/**
 * @desc    Verify clearance status for a parent/student
 * @route   GET /api/clearance/verify
 * @access  Private/Admin
 */
exports.verifyClearance = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId, studentId } = req.query;
    const clearanceStatus = await clearanceService.verifyClearance(Number(parentId), studentId ? Number(studentId) : undefined);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, clearanceStatus, "Clearance verification completed"));
});
/**
 * @desc    Get detailed clearance information
 * @route   GET /api/clearance/details
 * @access  Private/Admin
 */
exports.getClearanceDetails = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId, studentId } = req.query;
    const details = await clearanceService.getClearanceDetails(Number(parentId), studentId ? Number(studentId) : undefined);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, details, "Clearance details retrieved successfully"));
});
/**
 * @desc    Generate clearance certificate
 * @route   GET /api/clearance/certificate
 * @access  Private/Admin
 */
exports.generateClearanceCertificate = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId, studentId } = req.query;
    const certificate = await clearanceService.generateClearanceCertificate(Number(parentId), studentId ? Number(studentId) : undefined);
    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=clearance-certificate.pdf");
    res.status(200).send(certificate);
});
/**
 * @desc    Get all clearance requests
 * @route   GET /api/clearance/requests
 * @access  Private/Admin
 */
exports.getAllClearanceRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const requests = await clearanceService.getAllClearanceRequests(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requests, "Clearance requests retrieved successfully"));
});
/**
 * @desc    Approve clearance request
 * @route   PATCH /api/clearance/requests/:id/approve
 * @access  Private/Admin
 */
exports.approveClearanceRequest = (0, asyncHandler_1.default)(async (req, res) => {
    const requestId = Number(req.params.id);
    const approvedById = req.user?.id;
    if (!approvedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const approvedRequest = await clearanceService.approveClearanceRequest(requestId, approvedById);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, approvedRequest, "Clearance request approved successfully"));
});
/**
 * @desc    Reject clearance request
 * @route   PATCH /api/clearance/requests/:id/reject
 * @access  Private/Admin
 */
exports.rejectClearanceRequest = (0, asyncHandler_1.default)(async (req, res) => {
    const requestId = Number(req.params.id);
    const { reason } = req.body;
    const rejectedById = req.user?.id;
    if (!rejectedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const rejectedRequest = await clearanceService.rejectClearanceRequest(requestId, reason, rejectedById);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, rejectedRequest, "Clearance request rejected"));
});
/**
 * @desc    Get current user's clearance status
 * @route   GET /api/clearance/my-status
 * @access  Private/Parent
 */
exports.getMyClearanceStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const status = await clearanceService.getMyClearanceStatus(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, status, "Clearance status retrieved successfully"));
});
/**
 * @desc    Request clearance
 * @route   POST /api/clearance/request
 * @access  Private/Parent
 */
exports.requestClearance = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const { purpose, studentId } = req.body;
    const request = await clearanceService.requestClearance(userId, purpose, studentId);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, request, "Clearance request submitted successfully"));
});
/**
 * @desc    Get current user's clearance requests
 * @route   GET /api/clearance/my-requests
 * @access  Private/Parent
 */
exports.getMyClearanceRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const requests = await clearanceService.getMyClearanceRequests(userId, req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requests, "Clearance requests retrieved successfully"));
});
/**
 * @desc    Download clearance certificate
 * @route   GET /api/clearance/my-requests/:id/download
 * @access  Private/Parent
 */
exports.downloadMyClearance = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const requestId = Number(req.params.id);
    if (!userId) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const certificate = await clearanceService.downloadMyClearance(userId, requestId);
    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=my-clearance.pdf");
    res.status(200).send(certificate);
});
/**
 * @desc    Get clearance requirements
 * @route   GET /api/clearance/requirements
 * @access  Private
 */
exports.getClearanceRequirements = (0, asyncHandler_1.default)(async (req, res) => {
    const requirements = await clearanceService.getClearanceRequirements();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requirements, "Clearance requirements retrieved successfully"));
});
/**
 * @desc    Get clearance statistics
 * @route   GET /api/clearance/statistics
 * @access  Private/Admin
 */
exports.getClearanceStatistics = (0, asyncHandler_1.default)(async (req, res) => {
    const statistics = await clearanceService.getClearanceStatistics(req.query);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, statistics, "Clearance statistics retrieved successfully"));
});
/**
 * @desc    Bulk verify clearance
 * @route   POST /api/clearance/bulk-verify
 * @access  Private/Admin
 */
exports.bulkVerifyClearance = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentIds } = req.body;
    const verifiedById = req.user?.id;
    if (!verifiedById) {
        return res
            .status(401)
            .json(new ApiResponse_1.default(401, null, "User not authenticated"));
    }
    const results = await clearanceService.bulkVerifyClearance(parentIds, verifiedById);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, results, "Bulk clearance verification completed"));
});
/**
 * @desc    Export clearance report
 * @route   GET /api/clearance/reports/export
 * @access  Private/Admin
 */
exports.exportClearanceReport = (0, asyncHandler_1.default)(async (req, res) => {
    const report = await clearanceService.exportClearanceReport(req.query);
    // Set headers for file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=clearance-report.xlsx");
    res.status(200).send(report);
});
//# sourceMappingURL=clearance.controller.js.map