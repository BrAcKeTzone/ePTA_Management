"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovedStudentsByParentId = exports.getAllLinkRequestsByParentId = exports.getPendingLinksByParentId = exports.unlinkStudent = exports.requestLinkStudent = exports.getEnrollmentStats = exports.getStudentsByParentId = exports.rejectStudentLink = exports.approveStudentLink = exports.deleteStudent = exports.updateStudent = exports.getStudentByStudentId = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const client_1 = require("@prisma/client");
// Create a new student
const createStudent = async (studentData) => {
    try {
        // Check if student ID already exists
        const existingStudent = await prisma_1.default.student.findUnique({
            where: { studentId: studentData.studentId },
        });
        if (existingStudent) {
            throw new ApiError_1.default(400, "Student ID already exists");
        }
        // Verify parent exists (if provided)
        if (studentData.parentId) {
            const parent = await prisma_1.default.user.findUnique({
                where: { id: studentData.parentId },
            });
            if (!parent) {
                throw new ApiError_1.default(404, "Parent not found");
            }
        }
        // Prepare data with defaults for optional fields
        const dataToCreate = {
            studentId: studentData.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            middleName: studentData.middleName,
            birthDate: studentData.birthDate,
            yearEnrolled: studentData.yearEnrolled,
        };
        // Only include parentId if it's provided
        if (studentData.parentId) {
            dataToCreate.parentId = studentData.parentId;
        }
        const student = await prisma_1.default.student.create({
            data: dataToCreate,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        return student;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.default(400, "Student ID already exists");
            }
        }
        throw error;
    }
};
exports.createStudent = createStudent;
// Get all students with filtering and pagination
const getStudents = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const whereClause = {};
    // Search filter (name or student ID)
    if (filters.search) {
        whereClause.OR = [
            {
                studentId: {
                    contains: filters.search,
                },
            },
            {
                firstName: {
                    contains: filters.search,
                },
            },
            {
                lastName: {
                    contains: filters.search,
                },
            },
        ];
    }
    // Other filters
    if (filters.yearEnrolled) {
        whereClause.yearEnrolled = filters.yearEnrolled;
    }
    if (filters.status) {
        whereClause.status = filters.status;
    }
    if (filters.linkStatus) {
        whereClause.linkStatus = filters.linkStatus;
    }
    if (filters.parentId) {
        whereClause.parentId = filters.parentId;
    }
    // Filter for students with or without parent
    if (filters.hasParent !== undefined) {
        if (filters.hasParent) {
            whereClause.parentId = { not: null };
        }
        else {
            whereClause.parentId = null;
        }
    }
    // Exclude students who already have an approved parent link
    if (filters.excludeLinked) {
        whereClause.linkStatus = { not: client_1.LinkStatus.APPROVED };
    }
    const [students, totalCount] = await Promise.all([
        prisma_1.default.student.findMany({
            where: whereClause,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            skip,
            take: limit,
        }),
        prisma_1.default.student.count({ where: whereClause }),
    ]);
    return {
        students,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
    };
};
exports.getStudents = getStudents;
// Get student by ID
const getStudentById = async (id) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    return student;
};
exports.getStudentById = getStudentById;
// Get student by student ID
const getStudentByStudentId = async (studentId) => {
    const student = await prisma_1.default.student.findUnique({
        where: { studentId },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    return student;
};
exports.getStudentByStudentId = getStudentByStudentId;
// Update student
const updateStudent = async (id, updateData) => {
    // Check if student exists
    const existingStudent = await prisma_1.default.student.findUnique({
        where: { id },
    });
    if (!existingStudent) {
        throw new ApiError_1.default(404, "Student not found");
    }
    try {
        const updatedStudent = await prisma_1.default.student.update({
            where: { id },
            data: updateData,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        return updatedStudent;
    }
    catch (error) {
        throw error;
    }
};
exports.updateStudent = updateStudent;
// Delete student
const deleteStudent = async (id) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    await prisma_1.default.student.delete({
        where: { id },
    });
    return { message: "Student deleted successfully" };
};
exports.deleteStudent = deleteStudent;
// Approve student linking
const approveStudentLink = async (id) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    if (student.linkStatus !== client_1.LinkStatus.PENDING) {
        throw new ApiError_1.default(400, "Student link is not pending approval");
    }
    const updatedStudent = await prisma_1.default.student.update({
        where: { id },
        data: { linkStatus: client_1.LinkStatus.APPROVED },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    return updatedStudent;
};
exports.approveStudentLink = approveStudentLink;
// Reject student linking
const rejectStudentLink = async (id, rejectionReason) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    if (student.linkStatus !== client_1.LinkStatus.PENDING) {
        throw new ApiError_1.default(400, "Student link is not pending approval");
    }
    const updatedStudent = await prisma_1.default.student.update({
        where: { id },
        data: {
            linkStatus: client_1.LinkStatus.REJECTED,
            rejectionReason: rejectionReason || null,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    return updatedStudent;
};
exports.rejectStudentLink = rejectStudentLink;
// Get students by parent ID
const getStudentsByParentId = async (parentId) => {
    const students = await prisma_1.default.student.findMany({
        where: { parentId },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return students;
};
exports.getStudentsByParentId = getStudentsByParentId;
// Get enrollment statistics
const getEnrollmentStats = async () => {
    const [totalStudents, activeStudents, graduatedStudents, inactiveStudents, pendingLinks, byYearEnrolled,] = await Promise.all([
        prisma_1.default.student.count(),
        prisma_1.default.student.count({ where: { status: client_1.StudentStatus.ACTIVE } }),
        prisma_1.default.student.count({ where: { status: client_1.StudentStatus.GRADUATED } }),
        prisma_1.default.student.count({ where: { status: client_1.StudentStatus.INACTIVE } }),
        prisma_1.default.student.count({ where: { linkStatus: client_1.LinkStatus.PENDING } }),
        prisma_1.default.student.groupBy({
            by: ["yearEnrolled"],
            _count: { yearEnrolled: true },
        }),
    ]);
    return {
        totalStudents,
        activeStudents,
        graduatedStudents,
        inactiveStudents,
        pendingLinks,
        byYearEnrolled: byYearEnrolled.map((item) => ({
            yearEnrolled: item.yearEnrolled,
            count: item._count.yearEnrolled,
        })),
    };
};
exports.getEnrollmentStats = getEnrollmentStats;
// Request to link a student to a parent account
const requestLinkStudent = async (studentId, parentId, relationship) => {
    // Verify parent exists
    const parent = await prisma_1.default.user.findUnique({
        where: { id: parentId },
    });
    if (!parent) {
        throw new ApiError_1.default(404, "Parent account not found");
    }
    if (parent.role !== "PARENT") {
        throw new ApiError_1.default(400, "Only parent accounts can link students");
    }
    // Find student by student ID
    const student = await prisma_1.default.student.findUnique({
        where: { studentId },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    // Check if student is already linked to this parent
    if (student.parentId === parentId &&
        student.linkStatus === client_1.LinkStatus.APPROVED) {
        throw new ApiError_1.default(400, "Student is already linked to your account");
    }
    // Check if student is already linked to another parent
    if (student.linkStatus === client_1.LinkStatus.APPROVED &&
        student.parentId !== parentId) {
        throw new ApiError_1.default(400, "Student is already linked to another parent. A student can only have one parent account.");
    }
    // Check if there's already a pending request from this parent
    if (student.parentId === parentId &&
        student.linkStatus === client_1.LinkStatus.PENDING) {
        throw new ApiError_1.default(400, "Link request is already pending approval");
    }
    // Update student with new parent ID, relationship, and set status to PENDING
    const updatedStudent = await prisma_1.default.student.update({
        where: { id: student.id },
        data: {
            parentId,
            linkStatus: client_1.LinkStatus.PENDING,
            relationship: relationship || "PARENT", // Default to PARENT if not provided
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
    return updatedStudent;
};
exports.requestLinkStudent = requestLinkStudent;
// Unlink a student from parent (by parent or admin)
const unlinkStudent = async (studentId, requestingUserId, requestingUserRole) => {
    const student = await prisma_1.default.student.findUnique({
        where: { id: studentId },
        include: {
            parent: true,
        },
    });
    if (!student) {
        throw new ApiError_1.default(404, "Student not found");
    }
    // Check if student is linked
    if (student.linkStatus !== client_1.LinkStatus.APPROVED) {
        throw new ApiError_1.default(400, "Student is not currently linked to any parent");
    }
    // Only the linked parent or admin can unlink
    if (requestingUserRole !== "ADMIN" && student.parentId !== requestingUserId) {
        throw new ApiError_1.default(403, "You can only unlink your own students");
    }
    // We don't delete the student, just change the link status to REJECTED
    // This maintains the student record while removing the parent association
    await prisma_1.default.student.update({
        where: { id: studentId },
        data: {
            linkStatus: client_1.LinkStatus.REJECTED,
        },
    });
    return { message: "Student unlinked successfully" };
};
exports.unlinkStudent = unlinkStudent;
// Get pending link requests for a specific parent
const getPendingLinksByParentId = async (parentId) => {
    const students = await prisma_1.default.student.findMany({
        where: {
            parentId,
            linkStatus: client_1.LinkStatus.PENDING,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return students;
};
exports.getPendingLinksByParentId = getPendingLinksByParentId;
// Get all link requests (PENDING and REJECTED) for a specific parent
const getAllLinkRequestsByParentId = async (parentId) => {
    const students = await prisma_1.default.student.findMany({
        where: {
            parentId,
            linkStatus: {
                in: [client_1.LinkStatus.PENDING, client_1.LinkStatus.REJECTED],
            },
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: [{ createdAt: "desc" }], // Most recent first
    });
    return students;
};
exports.getAllLinkRequestsByParentId = getAllLinkRequestsByParentId;
// Get approved (linked) students for a specific parent
const getApprovedStudentsByParentId = async (parentId) => {
    const students = await prisma_1.default.student.findMany({
        where: {
            parentId,
            linkStatus: client_1.LinkStatus.APPROVED,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return students;
};
exports.getApprovedStudentsByParentId = getApprovedStudentsByParentId;
//# sourceMappingURL=students.service.js.map