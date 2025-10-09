import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import * as contributionService from "./contributions.service";
import ApiError from "../../utils/ApiError";

/**
 * @desc    Create a new contribution
 * @route   POST /api/contributions
 * @access  Private (Admin only)
 */
export const createContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body;

    const contribution = await contributionService.createContribution(data);

    res
      .status(201)
      .json(
        new ApiResponse(201, contribution, "Contribution created successfully")
      );
  }
);

/**
 * @desc    Get contributions with filtering
 * @route   GET /api/contributions
 * @access  Private
 */
export const getContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as any,
      status: req.query.status as any,
      isPaid:
        req.query.isPaid === "true"
          ? true
          : req.query.isPaid === "false"
          ? false
          : undefined,
      isOverdue:
        req.query.isOverdue === "true"
          ? true
          : req.query.isOverdue === "false"
          ? false
          : undefined,
      isWaived:
        req.query.isWaived === "true"
          ? true
          : req.query.isWaived === "false"
          ? false
          : undefined,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await contributionService.getContributions(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Contributions retrieved successfully")
      );
  }
);

/**
 * @desc    Get contribution by ID
 * @route   GET /api/contributions/:id
 * @access  Private
 */
export const getContributionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const contribution = await contributionService.getContributionById(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contribution,
          "Contribution retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Update contribution
 * @route   PUT /api/contributions/:id
 * @access  Private (Admin only)
 */
export const updateContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body;

    const contribution = await contributionService.updateContribution(id, data);

    res
      .status(200)
      .json(
        new ApiResponse(200, contribution, "Contribution updated successfully")
      );
  }
);

/**
 * @desc    Delete contribution
 * @route   DELETE /api/contributions/:id
 * @access  Private (Admin only)
 */
export const deleteContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const result = await contributionService.deleteContribution(id);

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Record a payment for a contribution
 * @route   POST /api/contributions/:id/payment
 * @access  Private (Admin only)
 */
export const recordPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const paymentData = {
      ...req.body,
      recordedBy: req.user?.id, // From auth middleware
    };

    if (!paymentData.recordedBy) {
      throw new ApiError(401, "User not authenticated");
    }

    const result = await contributionService.recordPayment(id, paymentData);

    res
      .status(201)
      .json(new ApiResponse(201, result, "Payment recorded successfully"));
  }
);

/**
 * @desc    Waive a contribution
 * @route   POST /api/contributions/:id/waive
 * @access  Private (Admin only)
 */
export const waiveContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { waiverReason } = req.body;
    const waivedBy = req.user?.id;

    if (!waivedBy) {
      throw new ApiError(401, "User not authenticated");
    }

    const contribution = await contributionService.waiveContribution(
      id,
      waiverReason,
      waivedBy
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, contribution, "Contribution waived successfully")
      );
  }
);

/**
 * @desc    Update overdue status for contributions
 * @route   POST /api/contributions/update-overdue
 * @access  Private (Admin only)
 */
export const updateOverdueStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await contributionService.updateOverdueStatus();

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Generate contribution report
 * @route   GET /api/contributions/report
 * @access  Private (Admin only)
 */
export const generateContributionReport = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as any,
      status: req.query.status as any,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      includeStats: req.query.includeStats === "false" ? false : true,
      groupBy: req.query.groupBy as string,
    };

    const report = await contributionService.generateContributionReport(
      filters
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          report,
          "Contribution report generated successfully"
        )
      );
  }
);

/**
 * @desc    Get contribution statistics
 * @route   GET /api/contributions/stats
 * @access  Private
 */
export const getContributionStats = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as any,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
    };

    const stats = await contributionService.getContributionStats(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Contribution statistics retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get current user's contributions
 * @route   GET /api/contributions/my-contributions
 * @access  Private
 */
export const getMyContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const filters = {
      parentId: userId,
      ...req.query,
    };

    const result = await contributionService.getContributions(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Your contributions retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get current user's balance summary
 * @route   GET /api/contributions/my-balance
 * @access  Private
 */
export const getMyBalance = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const balance = await contributionService.getUserBalance(userId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          balance,
          "Balance information retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get payment basis settings
 * @route   GET /api/contributions/payment-basis
 * @access  Private
 */
export const getPaymentBasis = asyncHandler(
  async (req: Request, res: Response) => {
    const settings = await contributionService.getPaymentBasisSettings();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "Payment basis settings retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get detailed payment basis settings
 * @route   GET /api/contributions/payment-basis-settings
 * @access  Private
 */
export const getPaymentBasisSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const settings =
      await contributionService.getDetailedPaymentBasisSettings();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "Detailed payment basis settings retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Update payment basis settings
 * @route   PUT /api/contributions/payment-basis
 * @access  Private (Admin only)
 */
export const updatePaymentBasis = asyncHandler(
  async (req: Request, res: Response) => {
    const settings = await contributionService.updatePaymentBasisSettings(
      req.body
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          settings,
          "Payment basis settings updated successfully"
        )
      );
  }
);

/**
 * @desc    Get contributions by parent
 * @route   GET /api/contributions/parent/:parentId
 * @access  Private
 */
export const getContributionsByParent = asyncHandler(
  async (req: Request, res: Response) => {
    const parentId = parseInt(req.params.parentId);
    const filters = {
      parentId,
      ...req.query,
    };

    const result = await contributionService.getContributions(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Parent contributions retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Get contributions by project
 * @route   GET /api/contributions/project/:projectId
 * @access  Private
 */
export const getContributionsByProject = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const filters = {
      projectId,
      ...req.query,
    };

    const result = await contributionService.getContributions(filters);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Project contributions retrieved successfully"
        )
      );
  }
);

/**
 * @desc    Verify contribution payment
 * @route   POST /api/contributions/:id/verify
 * @access  Private (Admin only)
 */
export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const contributionId = parseInt(req.params.id);
    const { verified, notes } = req.body;

    const contribution = await contributionService.verifyContributionPayment(
      contributionId,
      verified,
      notes
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contribution,
          "Payment verification updated successfully"
        )
      );
  }
);

/**
 * @desc    Generate financial report
 * @route   GET /api/contributions/reports/financial
 * @access  Private (Admin only)
 */
export const generateFinancialReport = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as string,
      status: req.query.status as string,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
      includeStats: req.query.includeStats === "true",
      groupBy: req.query.groupBy as string,
    };

    const report = await contributionService.generateFinancialReport(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, report, "Financial report generated successfully")
      );
  }
);

/**
 * @desc    Generate financial report PDF
 * @route   GET /api/contributions/reports/financial/pdf
 * @access  Private (Admin only)
 */
export const generateFinancialReportPDF = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as string,
      status: req.query.status as string,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
    };

    const pdfBuffer = await contributionService.generateFinancialReportPDF(
      filters
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="financial-report.pdf"'
    );
    res.send(pdfBuffer);
  }
);

/**
 * @desc    Generate financial report CSV
 * @route   GET /api/contributions/reports/financial/csv
 * @access  Private (Admin only)
 */
export const generateFinancialReportCSV = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      projectId: req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined,
      type: req.query.type as string,
      status: req.query.status as string,
      academicYear: req.query.academicYear as string,
      period: req.query.period as string,
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
    };

    const csvData = await contributionService.generateFinancialReportCSV(
      filters
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="financial-report.csv"'
    );
    res.send(csvData);
  }
);
