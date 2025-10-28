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
exports.getPendingParentLinks = exports.searchStudents = exports.getMyLinkRequests = exports.getMyChildren = exports.getApprovedStudentsByParentId = exports.getPendingLinksByParentId = exports.unlinkStudent = exports.requestLinkStudent = exports.getPendingStudents = exports.bulkUpdateStudentStatus = exports.getEnrollmentStats = exports.getStudentsByParentId = exports.rejectStudentLink = exports.approveStudentLink = exports.deleteStudent = exports.updateStudent = exports.getStudentByStudentId = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const studentService = __importStar(require("./students.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const ApiResponse_1 = __importDefault(require("../../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const client_1 = require("@prisma/client");
// Create a new student
exports.createStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const studentData = req.body;
    const student = await studentService.createStudent(studentData);
    res
        .status(201)
        .json(new ApiResponse_1.default(201, student, "Student created successfully"));
});
// Get all students with filtering and pagination
exports.getStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, yearEnrolled, status, linkStatus, parentId, page = 1, limit = 10, } = req.query;
    // Parse and validate query parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {};
    if (search)
        filters.search = search;
    if (yearEnrolled)
        filters.yearEnrolled = yearEnrolled;
    if (status)
        filters.status = status;
    if (linkStatus)
        filters.linkStatus = linkStatus;
    if (parentId)
        filters.parentId = parseInt(parentId, 10);
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Students retrieved successfully"));
});
// Get student by ID
exports.getStudentById = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.getStudentById(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student retrieved successfully"));
});
// Get student by student ID
exports.getStudentByStudentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId } = req.params;
    const student = await studentService.getStudentByStudentId(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student retrieved successfully"));
});
// Update student
exports.updateStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    // Extract only the allowed update fields from req.body
    const { firstName, lastName, middleName, birthDate, yearEnrolled, status, linkStatus, } = req.body;
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
        .json(new ApiResponse_1.default(200, student, "Student updated successfully"));
});
// Delete student
exports.deleteStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const result = await studentService.deleteStudent(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Student deleted successfully"));
});
// Approve student linking
exports.approveStudentLink = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.approveStudentLink(studentId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student link approved successfully"));
});
// Reject student linking
exports.rejectStudentLink = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    const student = await studentService.rejectStudentLink(studentId, rejectionReason);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Student link rejected successfully"));
});
// Get students by parent ID
exports.getStudentsByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getStudentsByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Students retrieved successfully"));
});
// Get enrollment statistics
exports.getEnrollmentStats = (0, asyncHandler_1.default)(async (req, res) => {
    const stats = await studentService.getEnrollmentStats();
    res
        .status(200)
        .json(new ApiResponse_1.default(200, stats, "Enrollment statistics retrieved successfully"));
});
// Bulk update student status
exports.bulkUpdateStudentStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentIds, status } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw new ApiError_1.default(400, "Student IDs array is required");
    }
    if (!Object.values(client_1.StudentStatus).includes(status)) {
        throw new ApiError_1.default(400, "Invalid student status");
    }
    // Update each student individually to ensure proper validation
    const updatePromises = studentIds.map((id) => studentService.updateStudent(id, { status }));
    try {
        const updatedStudents = await Promise.all(updatePromises);
        res
            .status(200)
            .json(new ApiResponse_1.default(200, updatedStudents, "Students status updated successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(500, "Failed to update some students");
    }
});
// Get students pending approval
exports.getPendingStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        linkStatus: client_1.LinkStatus.PENDING,
    };
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Pending students retrieved successfully"));
});
// Request to link a student (by parent)
exports.requestLinkStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { studentId, relationship } = req.body;
    const parentId = req.user.id; // Get from auth middleware
    if (!studentId) {
        throw new ApiError_1.default(400, "Student ID is required");
    }
    const student = await studentService.requestLinkStudent(studentId, parentId, relationship);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, student, "Link request submitted successfully"));
});
// Unlink a student from parent
exports.unlinkStudent = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { userId, userRole } = req.body; // These should come from auth middleware in production
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
        throw new ApiError_1.default(400, "Invalid student ID");
    }
    if (!userId || !userRole) {
        throw new ApiError_1.default(401, "User authentication required");
    }
    const result = await studentService.unlinkStudent(studentId, userId, userRole);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Student unlinked successfully"));
});
// Get pending link requests for a parent
exports.getPendingLinksByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getPendingLinksByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Pending link requests retrieved successfully"));
});
// Get approved (linked) students for a parent
exports.getApprovedStudentsByParentId = (0, asyncHandler_1.default)(async (req, res) => {
    const { parentId } = req.params;
    const parentIdNum = parseInt(parentId, 10);
    if (isNaN(parentIdNum)) {
        throw new ApiError_1.default(400, "Invalid parent ID");
    }
    const students = await studentService.getApprovedStudentsByParentId(parentIdNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "Linked students retrieved successfully"));
});
// Get authenticated user's children
exports.getMyChildren = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const students = await studentService.getApprovedStudentsByParentId(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, students, "My children retrieved successfully"));
});
// Get authenticated user's pending link requests
exports.getMyLinkRequests = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    const requests = await studentService.getAllLinkRequestsByParentId(userId);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, requests, "Link requests retrieved successfully"));
});
// Search students by query
exports.searchStudents = (0, asyncHandler_1.default)(async (req, res) => {
    const { q, page = 1, limit = 50 } = req.query;
    if (!q || typeof q !== "string") {
        throw new ApiError_1.default(400, "Search query is required");
    }
    // Parse and validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        search: q,
        excludeLinked: true, // Exclude students who already have an approved parent link
    };
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Students found successfully"));
});
// Get all pending parent-student link requests (Admin only)
exports.getPendingParentLinks = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    // Parse and validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(400, "Invalid pagination parameters");
    }
    const filters = {
        // Only show students that have a parent assigned (actual link requests)
        hasParent: true,
    };
    // Only add linkStatus filter if status is provided
    // If no status, return all students with any parent assignment
    if (status) {
        filters.linkStatus = status;
    }
    const result = await studentService.getStudents(filters, pageNum, limitNum);
    res
        .status(200)
        .json(new ApiResponse_1.default(200, result, "Link requests retrieved successfully"));
});
//# sourceMappingURL=students.controller.js.map