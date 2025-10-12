import { Request, Response } from "express";
import * as studentService from "./students.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import { StudentStatus, LinkStatus } from "@prisma/client";

// Create a new student
export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const studentData = req.body;
    const student = await studentService.createStudent(studentData);
    res
      .status(201)
      .json(new ApiResponse(201, student, "Student created successfully"));
  }
);

// Get all students with filtering and pagination
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    yearEnrolled,
    status,
    linkStatus,
    parentId,
    page = 1,
    limit = 10,
  } = req.query;

  // Parse and validate query parameters
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  const filters: studentService.StudentSearchFilters = {};

  if (search) filters.search = search as string;
  if (yearEnrolled) filters.yearEnrolled = yearEnrolled as string;
  if (status) filters.status = status as StudentStatus;
  if (linkStatus) filters.linkStatus = linkStatus as LinkStatus;
  if (parentId) filters.parentId = parseInt(parentId as string, 10);

  const result = await studentService.getStudents(filters, pageNum, limitNum);
  res
    .status(200)
    .json(new ApiResponse(200, result, "Students retrieved successfully"));
});

// Get student by ID
export const getStudentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.getStudentById(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student retrieved successfully"));
  }
);

// Get student by student ID
export const getStudentByStudentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const student = await studentService.getStudentByStudentId(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student retrieved successfully"));
  }
);

// Update student
export const updateStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    // Extract only the allowed update fields from req.body
    const {
      firstName,
      lastName,
      middleName,
      birthDate,
      yearEnrolled,
      status,
      linkStatus,
    } = req.body;

    const updateData = {
      firstName,
      lastName,
      middleName,
      birthDate,
      yearEnrolled,
      status,
      linkStatus,
    };

    const student = await studentService.updateStudent(studentId, updateData);
    res
      .status(200)
      .json(new ApiResponse(200, student, "Student updated successfully"));
  }
);

// Delete student
export const deleteStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const result = await studentService.deleteStudent(studentId);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Student deleted successfully"));
  }
);

// Approve student linking
export const approveStudentLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.approveStudentLink(studentId);
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student link approved successfully")
      );
  }
);

// Reject student linking
export const rejectStudentLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    const student = await studentService.rejectStudentLink(
      studentId,
      rejectionReason
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Student link rejected successfully")
      );
  }
);

// Get students by parent ID
export const getStudentsByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students = await studentService.getStudentsByParentId(parentIdNum);
    res
      .status(200)
      .json(new ApiResponse(200, students, "Students retrieved successfully"));
  }
);

// Get enrollment statistics
export const getEnrollmentStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await studentService.getEnrollmentStats();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Enrollment statistics retrieved successfully"
        )
      );
  }
);

// Bulk update student status
export const bulkUpdateStudentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentIds, status } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new ApiError(400, "Student IDs array is required");
    }

    if (!Object.values(StudentStatus).includes(status)) {
      throw new ApiError(400, "Invalid student status");
    }

    // Update each student individually to ensure proper validation
    const updatePromises = studentIds.map((id: number) =>
      studentService.updateStudent(id, { status })
    );

    try {
      const updatedStudents = await Promise.all(updatePromises);
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedStudents,
            "Students status updated successfully"
          )
        );
    } catch (error) {
      throw new ApiError(500, "Failed to update some students");
    }
  }
);

// Get students pending approval
export const getPendingStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      linkStatus: LinkStatus.PENDING,
    };

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Pending students retrieved successfully")
      );
  }
);

// Request to link a student (by parent)
export const requestLinkStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId, relationship } = req.body;
    const parentId = (req as any).user.id; // Get from auth middleware

    if (!studentId) {
      throw new ApiError(400, "Student ID is required");
    }

    const student = await studentService.requestLinkStudent(
      studentId,
      parentId,
      relationship
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, student, "Link request submitted successfully")
      );
  }
);

// Unlink a student from parent
export const unlinkStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, userRole } = req.body; // These should come from auth middleware in production

    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      throw new ApiError(400, "Invalid student ID");
    }

    if (!userId || !userRole) {
      throw new ApiError(401, "User authentication required");
    }

    const result = await studentService.unlinkStudent(
      studentId,
      userId,
      userRole
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Student unlinked successfully"));
  }
);

// Get pending link requests for a parent
export const getPendingLinksByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students = await studentService.getPendingLinksByParentId(
      parentIdNum
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          students,
          "Pending link requests retrieved successfully"
        )
      );
  }
);

// Get approved (linked) students for a parent
export const getApprovedStudentsByParentId = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);

    if (isNaN(parentIdNum)) {
      throw new ApiError(400, "Invalid parent ID");
    }

    const students = await studentService.getApprovedStudentsByParentId(
      parentIdNum
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, students, "Linked students retrieved successfully")
      );
  }
);

// Get authenticated user's children
export const getMyChildren = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware

    const students = await studentService.getApprovedStudentsByParentId(userId);
    res
      .status(200)
      .json(
        new ApiResponse(200, students, "My children retrieved successfully")
      );
  }
);

// Get authenticated user's pending link requests
export const getMyLinkRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // From auth middleware

    const requests = await studentService.getAllLinkRequestsByParentId(userId);
    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Link requests retrieved successfully")
      );
  }
);

// Search students by query
export const searchStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, page = 1, limit = 50 } = req.query;

    if (!q || typeof q !== "string") {
      throw new ApiError(400, "Search query is required");
    }

    // Parse and validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      search: q,
      excludeLinked: true, // Exclude students who already have an approved parent link
    };

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Students found successfully"));
  }
);

// Get all pending parent-student link requests (Admin only)
export const getPendingParentLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status } = req.query;

    // Parse and validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const filters: studentService.StudentSearchFilters = {
      // Only show students that have a parent assigned (actual link requests)
      hasParent: true,
    };

    // Only add linkStatus filter if status is provided
    // If no status, return all students with any parent assignment
    if (status) {
      filters.linkStatus = status as any;
    }

    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Link requests retrieved successfully")
      );
  }
);
