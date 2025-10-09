import { Request, Response } from "express";
import * as clearanceService from "./clearance.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

/**
 * @desc    Search for parent and student information
 * @route   GET /api/clearance/search
 * @access  Private/Admin
 */
export const searchParentStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { q } = req.query;
    const results = await clearanceService.searchParentStudent(q as string);

    res
      .status(200)
      .json(new ApiResponse(200, results, "Search completed successfully"));
  }
);

/**
 * @desc    Verify clearance status for a parent/student
 * @route   GET /api/clearance/verify
 * @access  Private/Admin
 */
export const verifyClearance = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId, studentId } = req.query;

    const clearanceStatus = await clearanceService.verifyClearance(
      Number(parentId),
      studentId ? Number(studentId) : undefined
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          clearanceStatus,
          "Clearance verification completed"
        )
      );
  }
);

/**
 * @desc    Get detailed clearance information
 * @route   GET /api/clearance/details
 * @access  Private/Admin
 */
export const getClearanceDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId, studentId } = req.query;

    const details = await clearanceService.getClearanceDetails(
      Number(parentId),
      studentId ? Number(studentId) : undefined
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          details,
          "Clearance details retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Generate clearance certificate
 * @route   GET /api/clearance/certificate
 * @access  Private/Admin
 */
export const generateClearanceCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId, studentId } = req.query;

    const certificate = await clearanceService.generateClearanceCertificate(
      Number(parentId),
      studentId ? Number(studentId) : undefined
    );

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=clearance-certificate.pdf"
    );

    res.status(200).send(certificate);
  }
);

/**
 * @desc    Get all clearance requests
 * @route   GET /api/clearance/requests
 * @access  Private/Admin
 */
export const getAllClearanceRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const requests = await clearanceService.getAllClearanceRequests(req.query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Clearance requests retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Approve clearance request
 * @route   PATCH /api/clearance/requests/:id/approve
 * @access  Private/Admin
 */
export const approveClearanceRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.id);
    const approvedById = req.user?.id;

    if (!approvedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const approvedRequest = await clearanceService.approveClearanceRequest(
      requestId,
      approvedById
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          approvedRequest,
          "Clearance request approved successfully"
        )
      );
  }
);

/**
 * @desc    Reject clearance request
 * @route   PATCH /api/clearance/requests/:id/reject
 * @access  Private/Admin
 */
export const rejectClearanceRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.id);
    const { reason } = req.body;
    const rejectedById = req.user?.id;

    if (!rejectedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const rejectedRequest = await clearanceService.rejectClearanceRequest(
      requestId,
      reason,
      rejectedById
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, rejectedRequest, "Clearance request rejected")
      );
  }
);

/**
 * @desc    Get current user's clearance status
 * @route   GET /api/clearance/my-status
 * @access  Private/Parent
 */
export const getMyClearanceStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const status = await clearanceService.getMyClearanceStatus(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, status, "Clearance status retrieved successfully")
      );
  }
);

/**
 * @desc    Request clearance
 * @route   POST /api/clearance/request
 * @access  Private/Parent
 */
export const requestClearance = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const { purpose, studentId } = req.body;
    const request = await clearanceService.requestClearance(
      userId,
      purpose,
      studentId
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          request,
          "Clearance request submitted successfully"
        )
      );
  }
);

/**
 * @desc    Get current user's clearance requests
 * @route   GET /api/clearance/my-requests
 * @access  Private/Parent
 */
export const getMyClearanceRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const requests = await clearanceService.getMyClearanceRequests(
      userId,
      req.query
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requests,
          "Clearance requests retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Download clearance certificate
 * @route   GET /api/clearance/my-requests/:id/download
 * @access  Private/Parent
 */
export const downloadMyClearance = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const requestId = Number(req.params.id);

    if (!userId) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const certificate = await clearanceService.downloadMyClearance(
      userId,
      requestId
    );

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=my-clearance.pdf"
    );

    res.status(200).send(certificate);
  }
);

/**
 * @desc    Get clearance requirements
 * @route   GET /api/clearance/requirements
 * @access  Private
 */
export const getClearanceRequirements = asyncHandler(
  async (req: Request, res: Response) => {
    const requirements = await clearanceService.getClearanceRequirements();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          requirements,
          "Clearance requirements retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get clearance statistics
 * @route   GET /api/clearance/statistics
 * @access  Private/Admin
 */
export const getClearanceStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await clearanceService.getClearanceStatistics(req.query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          statistics,
          "Clearance statistics retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Bulk verify clearance
 * @route   POST /api/clearance/bulk-verify
 * @access  Private/Admin
 */
export const bulkVerifyClearance = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentIds } = req.body;
    const verifiedById = req.user?.id;

    if (!verifiedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const results = await clearanceService.bulkVerifyClearance(
      parentIds,
      verifiedById
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, results, "Bulk clearance verification completed")
      );
  }
);

/**
 * @desc    Export clearance report
 * @route   GET /api/clearance/reports/export
 * @access  Private/Admin
 */
export const exportClearanceReport = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await clearanceService.exportClearanceReport(req.query);

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=clearance-report.xlsx"
    );

    res.status(200).send(report);
  }
);
