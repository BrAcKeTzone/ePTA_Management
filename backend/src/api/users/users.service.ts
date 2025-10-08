import prisma from "../../configs/prisma";
import { User, UserRole } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import bcrypt from "bcrypt";

interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  email?: string;
}

interface UpdateUserByAdminData {
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface GetUsersFilter {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface UserSafeData {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to exclude password from user object
const excludePassword = (user: any): UserSafeData => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get user by ID (admin only)
export const getUserById = async (id: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      students: {
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          program: true,
          yearLevel: true,
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
    throw new ApiError(404, "User not found");
  }

  return excludePassword(user);
};

// Get current user profile (self)
export const getUserProfile = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
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
          program: true,
          yearLevel: true,
          academicYear: true,
          status: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return excludePassword(user);
};

// Update user profile (self)
export const updateUserProfile = async (
  userId: number,
  data: UpdateUserProfileData
): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and is already taken
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
  });

  return excludePassword(updatedUser);
};

// Get all users with filters (admin only)
export const getAllUsers = async (filter: GetUsersFilter) => {
  const { search, role, isActive, page = 1, limit = 10 } = filter;

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  if (role) {
    whereClause.role = role;
  }

  if (typeof isActive === "boolean") {
    whereClause.isActive = isActive;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { role: "asc" }, // Admins first
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        email: true,
        name: true,
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
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: number,
  newRole: UserRole
): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if this is the last admin
  if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot change role of the last admin");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return excludePassword(updatedUser);
};

// Deactivate user (admin only)
export const deactivateUser = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(400, "User is already deactivated");
  }

  // Check if this is the last active admin
  if (user.role === UserRole.ADMIN) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ApiError(400, "Cannot deactivate the last active admin");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return excludePassword(updatedUser);
};

// Activate user (admin only)
export const activateUser = async (userId: number): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isActive) {
    throw new ApiError(400, "User is already active");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  return excludePassword(updatedUser);
};

// Update user by admin (admin only)
export const updateUserByAdmin = async (
  userId: number,
  data: UpdateUserByAdminData
): Promise<UserSafeData> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is being changed and is already taken
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use");
    }
  }

  // Check if changing role from admin
  if (
    data.role &&
    user.role === UserRole.ADMIN &&
    data.role !== UserRole.ADMIN
  ) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot change role of the last admin");
    }
  }

  // Check if deactivating admin
  if (
    data.isActive === false &&
    user.role === UserRole.ADMIN &&
    user.isActive
  ) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ApiError(400, "Cannot deactivate the last active admin");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return excludePassword(updatedUser);
};

// Delete user (admin only)
export const deleteUser = async (userId: number): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if this is the last admin
  if (user.role === UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot delete the last admin");
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });
};

// Change password (self)
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

// Get user statistics (admin only)
export const getUserStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    parentCount,
    usersWithStudents,
    usersWithoutStudents,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count({ where: { role: UserRole.PARENT } }),
    prisma.user.count({
      where: {
        role: UserRole.PARENT,
        students: {
          some: {
            linkStatus: "APPROVED",
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.PARENT,
        students: {
          none: {
            linkStatus: "APPROVED",
          },
        },
      },
    }),
    prisma.user.count({
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
