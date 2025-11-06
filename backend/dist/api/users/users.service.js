"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.changePassword = exports.deleteUser = exports.updateUserByAdmin = exports.activateUser = exports.deactivateUser = exports.updateUserRole = exports.getAllUsers = exports.updateUserProfile = exports.getUserProfile = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Helper function to exclude password from user object
const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Get user by ID (admin only)
const getUserById = async (id) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id },
        include: {
            students: {
                select: {
                    id: true,
                    studentId: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    lastfirstName: true,
                    lastName: true,
                    middleName: true,
                    middlefirstName: true,
                    lastName: true,
                    middleName: true,
                    birthDate: true,
                    yearEnrolled: true,
                    status: true,
                    linkStatus: true,
                },
            },
            _count: {
                select: {
                    students: true,
                    attendances: true,
                    contributions: true,
                    penalties: true,
                    createdAnnouncements: true,
                    createdMeetings: true,
                },
            },
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return excludePassword(user);
};
exports.getUserById = getUserById;
// Get current user profile (self)
const getUserProfile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            students: {
                where: {
                    linkStatus: "APPROVED",
                },
                select: {
                    id: true,
                    studentId: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    lastfirstName: true,
                    lastName: true,
                    middleName: true,
                    middlefirstName: true,
                    lastName: true,
                    middleName: true,
                    birthDate: true,
                    yearEnrolled: true,
                    status: true,
                    linkStatus: true,
                },
            },
        },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    return excludePassword(user);
};
exports.getUserProfile = getUserProfile;
// Update user profile (self)
const updateUserProfile = async (userId, data) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if email is being changed and is already taken
    if (data.email && data.email !== user.email) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new ApiError_1.default(400, "Email is already in use");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
        },
    });
    return excludePassword(updatedUser);
};
exports.updateUserProfile = updateUserProfile;
// Get all users with filters (admin only)
const getAllUsers = async (filter) => {
    const { search, role, isActive, sortBy, sortOrder, dateFrom, dateTo } = filter;
    // Parse pagination parameters
    const page = typeof filter.page === "string" ? parseInt(filter.page) : filter.page || 1;
    const limit = typeof filter.limit === "string"
        ? parseInt(filter.limit)
        : filter.limit || 10;
    const skip = (page - 1) * limit;
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }
    if (role) {
        // Validate and cast role to UserRole enum
        const roleUpper = typeof role === "string" ? role.toUpperCase() : role;
        if (roleUpper === client_1.UserRole.ADMIN || roleUpper === client_1.UserRole.PARENT) {
            whereClause.role = roleUpper;
        }
    }
    if (typeof isActive === "boolean") {
        whereClause.isActive = isActive;
    }
    else if (typeof isActive === "string") {
        // Convert string to boolean
        whereClause.isActive = isActive === "true";
    }
    // Date range filtering
    if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) {
            whereClause.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
            whereClause.createdAt.lte = new Date(dateTo);
        }
    }
    // Build orderBy clause
    const orderBy = [];
    if (sortBy &&
        ["firstName", "lastName", "email", "role", "createdAt", "updatedAt", "isActive"].includes(sortBy)) {
        orderBy.push({ [sortBy]: sortOrder || "asc" });
    }
    else {
        // Default sorting
        orderBy.push({ role: "asc" }); // Admins first
        orderBy.push({ createdAt: "desc" });
    }
    const [users, totalCount] = await Promise.all([
        prisma_1.default.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                middlefirstName: true,
                lastName: true,
                middleName: true,
                lastfirstName: true,
                lastName: true,
                middleName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        students: true,
                        attendances: true,
                        contributions: true,
                        penalties: true,
                    },
                },
            },
        }),
        prisma_1.default.user.count({ where: whereClause }),
    ]);
    return {
        users,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
    };
};
exports.getAllUsers = getAllUsers;
// Update user role (admin only)
const updateUserRole = async (userId, newRole) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if this is the last admin
    if (user.role === client_1.UserRole.ADMIN && newRole !== client_1.UserRole.ADMIN) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.ADMIN },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot change role of the last admin");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { role: newRole },
    });
    return excludePassword(updatedUser);
};
exports.updateUserRole = updateUserRole;
// Deactivate user (admin only)
const deactivateUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    if (!user.isActive) {
        throw new ApiError_1.default(400, "User is already deactivated");
    }
    // Check if this is the last active admin
    if (user.role === client_1.UserRole.ADMIN) {
        const activeAdminCount = await prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.ADMIN,
                isActive: true,
            },
        });
        if (activeAdminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot deactivate the last active admin");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { isActive: false },
    });
    return excludePassword(updatedUser);
};
exports.deactivateUser = deactivateUser;
// Activate user (admin only)
const activateUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    if (user.isActive) {
        throw new ApiError_1.default(400, "User is already active");
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { isActive: true },
    });
    return excludePassword(updatedUser);
};
exports.activateUser = activateUser;
// Update user by admin (admin only)
const updateUserByAdmin = async (userId, data) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if email is being changed and is already taken
    if (data.email && data.email !== user.email) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new ApiError_1.default(400, "Email is already in use");
        }
    }
    // Check if changing role from admin
    if (data.role &&
        user.role === client_1.UserRole.ADMIN &&
        data.role !== client_1.UserRole.ADMIN) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.ADMIN },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot change role of the last admin");
        }
    }
    // Check if deactivating admin
    if (data.isActive === false &&
        user.role === client_1.UserRole.ADMIN &&
        user.isActive) {
        const activeAdminCount = await prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.ADMIN,
                isActive: true,
            },
        });
        if (activeAdminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot deactivate the last active admin");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data,
    });
    return excludePassword(updatedUser);
};
exports.updateUserByAdmin = updateUserByAdmin;
// Delete user (admin only)
const deleteUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if this is the last admin
    if (user.role === client_1.UserRole.ADMIN) {
        const adminCount = await prisma_1.default.user.count({
            where: { role: client_1.UserRole.ADMIN },
        });
        if (adminCount <= 1) {
            throw new ApiError_1.default(400, "Cannot delete the last admin");
        }
    }
    await prisma_1.default.user.delete({
        where: { id: userId },
    });
};
exports.deleteUser = deleteUser;
// Change password (self)
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Verify current password
    const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(401, "Current password is incorrect");
    }
    // Hash new password
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    // Update password
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};
exports.changePassword = changePassword;
// Get user statistics (admin only)
const getUserStats = async () => {
    const [totalUsers, activeUsers, inactiveUsers, adminCount, parentCount, usersWithStudents, usersWithoutStudents, recentUsers,] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { isActive: true } }),
        prisma_1.default.user.count({ where: { isActive: false } }),
        prisma_1.default.user.count({ where: { role: client_1.UserRole.ADMIN } }),
        prisma_1.default.user.count({ where: { role: client_1.UserRole.PARENT } }),
        prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.PARENT,
                students: {
                    some: {
                        linkStatus: "APPROVED",
                    },
                },
            },
        }),
        prisma_1.default.user.count({
            where: {
                role: client_1.UserRole.PARENT,
                students: {
                    none: {
                        linkStatus: "APPROVED",
                    },
                },
            },
        }),
        prisma_1.default.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
        }),
    ]);
    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminCount,
        parentCount,
        usersWithStudents,
        usersWithoutStudents,
        recentUsers,
    };
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=users.service.js.map