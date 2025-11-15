import { Request, Response } from "express";
import * as officerService from "./officers.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

// Get all officers
export const getAllOfficers = asyncHandler(async (req: Request, res: Response) => {
  const officers = await officerService.getAllOfficers();
  
  return res.status(200).json(
    new ApiResponse(200, officers, "Officers retrieved successfully")
  );
});

// Assign an officer to a position
export const assignOfficer = asyncHandler(async (req: Request, res: Response) => {
  const { position, userId } = req.body;
  
  const officer = await officerService.assignOfficer(position, userId);
  
  return res.status(200).json(
    new ApiResponse(200, officer, "Officer assigned successfully")
  );
});

// Remove an officer from a position
export const removeOfficer = asyncHandler(async (req: Request, res: Response) => {
  const { position } = req.params;
  
  await officerService.removeOfficer(position);
  
  return res.status(200).json(
    new ApiResponse(200, null, "Officer removed successfully")
  );
});
