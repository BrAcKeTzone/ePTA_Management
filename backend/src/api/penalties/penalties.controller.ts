import { Request, Response } from "express";
import * as penaltyService from "./penalties.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

/**
 * @desc    Create a new penalty
 * @route   POST /api/penalties
 * @access  Private/Admin
 */
export const createPenalty = asyncHandler(
  async (req: Request, res: Response) => {
    const penalty = await penaltyService.createPenalty(req.body);

    res
      .status(201)
      .json(new ApiResponse(201, penalty, "Penalty created successfully"));
  }
);

/**
 * @desc    Get penalties with filters
 * @route   GET /api/penalties
 * @access  Private
 */
export const getPenalties = asyncHandler(
  async (req: Request, res: Response) => {
    // Convert query params to appropriate types
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      paymentStatus: req.query.paymentStatus as any,
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
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as any) || "createdAt",
      sortOrder: (req.query.sortOrder as any) || "desc",
    };

    const result = await penaltyService.getPenalties(filters);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Penalties retrieved successfully"));
  }
);

/**
 * @desc    Get penalty by ID
 * @route   GET /api/penalties/:id
 * @access  Private
 */
export const getPenaltyById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const penalty = await penaltyService.getPenaltyById(id);

    res
      .status(200)
      .json(new ApiResponse(200, penalty, "Penalty retrieved successfully"));
  }
);

/**
 * @desc    Update penalty
 * @route   PUT /api/penalties/:id
 * @access  Private/Admin
 */
export const updatePenalty = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const penalty = await penaltyService.updatePenalty(id, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, penalty, "Penalty updated successfully"));
  }
);

/**
 * @desc    Delete penalty
 * @route   DELETE /api/penalties/:id
 * @access  Private/Admin
 */
export const deletePenalty = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const result = await penaltyService.deletePenalty(id);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Penalty deleted successfully"));
  }
);

/**
 * @desc    Record a payment for a penalty
 * @route   POST /api/penalties/:id/payment
 * @access  Private/Admin
 */
export const recordPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const penaltyId = parseInt(req.params.id);
    const recordedById = req.user?.id;

    if (!recordedById) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const result = await penaltyService.recordPayment(
      penaltyId,
      req.body,
      recordedById
    );

    res
      .status(201)
      .json(new ApiResponse(201, result, "Payment recorded successfully"));
  }
);

/**
 * @desc    Waive a penalty
 * @route   POST /api/penalties/:id/waive
 * @access  Private/Admin
 */
export const waivePenalty = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const waivedBy = req.user?.id;

    if (!waivedBy) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    const penalty = await penaltyService.waivePenalty(
      id,
      req.body.waiverReason,
      waivedBy
    );

    res
      .status(200)
      .json(new ApiResponse(200, penalty, "Penalty waived successfully"));
  }
);

/**
 * @desc    Update overdue penalties status
 * @route   POST /api/penalties/update-overdue
 * @access  Private/Admin
 */
export const updateOverdueStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await penaltyService.updateOverdueStatus();

    res.status(200).json(new ApiResponse(200, result, result.message));
  }
);

/**
 * @desc    Generate penalty report
 * @route   GET /api/penalties/report
 * @access  Private/Admin
 */
export const generatePenaltyReport = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      paymentStatus: req.query.paymentStatus as any,
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
      includeStats: req.query.includeStats === "false" ? false : true,
      groupBy: req.query.groupBy as any,
    };

    const report = await penaltyService.generatePenaltyReport(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, report, "Penalty report generated successfully")
      );
  }
);

/**
 * @desc    Get penalty statistics
 * @route   GET /api/penalties/stats
 * @access  Private
 */
export const getPenaltyStats = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      parentId: req.query.parentId
        ? parseInt(req.query.parentId as string)
        : undefined,
      meetingId: req.query.meetingId
        ? parseInt(req.query.meetingId as string)
        : undefined,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
    };

    const stats = await penaltyService.getPenaltyStats(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Penalty statistics retrieved successfully")
      );
  }
);
