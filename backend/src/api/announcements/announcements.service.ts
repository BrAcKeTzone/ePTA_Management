import prisma from "../../configs/prisma";
import {
  Announcement,
  AnnouncementPriority,
  TargetAudience,
  UserRole,
} from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { sendAnnouncementNotifications } from "../../utils/announcementNotification";

interface CreateAnnouncementData {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience;
  targetProgram?: string;
  targetYearLevel?: string;
  isPublished?: boolean;
  publishDate?: Date;
  expiryDate?: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  createdById: number;
}

interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience;
  targetProgram?: string;
  targetYearLevel?: string;
  publishDate?: Date;
  expiryDate?: Date;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface GetAnnouncementsFilter {
  search?: string;
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience;
  isPublished?: boolean;
  createdById?: number;
  page?: number;
  limit?: number;
}

// Create a new announcement
export const createAnnouncement = async (
  data: CreateAnnouncementData
): Promise<Announcement> => {
  // Validate creator exists and is admin
  const creator = await prisma.user.findUnique({
    where: { id: data.createdById },
  });

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  if (creator.role !== UserRole.ADMIN) {
    throw new ApiError(403, "Only admins can create announcements");
  }

  // Validate target audience logic
  if (
    data.targetAudience === TargetAudience.SPECIFIC_PROGRAM &&
    !data.targetProgram
  ) {
    throw new ApiError(
      400,
      "Target program is required for SPECIFIC_PROGRAM audience"
    );
  }

  if (
    data.targetAudience === TargetAudience.SPECIFIC_YEAR_LEVEL &&
    !data.targetYearLevel
  ) {
    throw new ApiError(
      400,
      "Target year level is required for SPECIFIC_YEAR_LEVEL audience"
    );
  }

  // Validate dates
  if (
    data.publishDate &&
    data.expiryDate &&
    data.expiryDate <= data.publishDate
  ) {
    throw new ApiError(400, "Expiry date must be after publish date");
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority || AnnouncementPriority.MEDIUM,
      targetAudience: data.targetAudience || TargetAudience.ALL,
      targetProgram: data.targetProgram || null,
      targetYearLevel: data.targetYearLevel || null,
      isPublished: data.isPublished || false,
      publishDate: data.publishDate || null,
      expiryDate: data.expiryDate || null,
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
      createdById: data.createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return announcement;
};

// Get all announcements with filters and pagination
export const getAnnouncements = async (filter: GetAnnouncementsFilter) => {
  const {
    search,
    priority,
    targetAudience,
    isPublished,
    createdById,
    page = 1,
    limit = 10,
  } = filter;

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  if (priority) {
    whereClause.priority = priority;
  }

  if (targetAudience) {
    whereClause.targetAudience = targetAudience;
  }

  if (typeof isPublished === "boolean") {
    whereClause.isPublished = isPublished;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { priority: "desc" },
        { publishDate: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.announcement.count({ where: whereClause }),
  ]);

  return {
    announcements,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// Get active announcements (published and not expired)
export const getActiveAnnouncements = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const whereClause: any = {
    isPublished: true,
    OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
  };

  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.announcement.count({ where: whereClause }),
  ]);

  return {
    announcements,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

// Get announcement by ID
export const getAnnouncementById = async (
  id: number
): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return announcement;
};

// Update announcement
export const updateAnnouncement = async (
  id: number,
  data: UpdateAnnouncementData
): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  // Validate target audience logic
  const targetAudience = data.targetAudience || announcement.targetAudience;
  if (targetAudience === TargetAudience.SPECIFIC_PROGRAM) {
    const targetProgram =
      data.targetProgram !== undefined
        ? data.targetProgram
        : announcement.targetProgram;
    if (!targetProgram) {
      throw new ApiError(
        400,
        "Target program is required for SPECIFIC_PROGRAM audience"
      );
    }
  }

  if (targetAudience === TargetAudience.SPECIFIC_YEAR_LEVEL) {
    const targetYearLevel =
      data.targetYearLevel !== undefined
        ? data.targetYearLevel
        : announcement.targetYearLevel;
    if (!targetYearLevel) {
      throw new ApiError(
        400,
        "Target year level is required for SPECIFIC_YEAR_LEVEL audience"
      );
    }
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedAnnouncement;
};

// Delete announcement
export const deleteAnnouncement = async (id: number): Promise<void> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  await prisma.announcement.delete({
    where: { id },
  });
};

// Publish announcement and send notifications
export const publishAnnouncement = async (
  id: number,
  publishDate?: Date,
  sendNotifications: boolean = true
): Promise<{ announcement: Announcement; notificationResult?: any }> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  if (announcement.isPublished) {
    throw new ApiError(400, "Announcement is already published");
  }

  // Update announcement to published
  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: {
      isPublished: true,
      publishDate: publishDate || new Date(),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  let notificationResult = null;

  // Send notifications if requested
  if (sendNotifications) {
    const recipients = await getTargetedRecipients(updatedAnnouncement);

    if (recipients.length > 0) {
      notificationResult = await sendAnnouncementNotifications({
        title: updatedAnnouncement.title,
        content: updatedAnnouncement.content,
        priority: updatedAnnouncement.priority,
        recipients,
        attachmentUrl: updatedAnnouncement.attachmentUrl || undefined,
      });
    }
  }

  return {
    announcement: updatedAnnouncement,
    notificationResult,
  };
};

// Unpublish announcement
export const unpublishAnnouncement = async (
  id: number
): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  if (!announcement.isPublished) {
    throw new ApiError(400, "Announcement is not published");
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: {
      isPublished: false,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedAnnouncement;
};

// Helper function to get targeted recipients based on announcement audience
const getTargetedRecipients = async (
  announcement: Announcement
): Promise<Array<{ email: string; name: string }>> => {
  let whereClause: any = {};

  switch (announcement.targetAudience) {
    case TargetAudience.ALL:
      // Send to all users (both admins and parents)
      break;

    case TargetAudience.PARENTS:
      whereClause.role = UserRole.PARENT;
      break;

    case TargetAudience.ADMINS:
      whereClause.role = UserRole.ADMIN;
      break;

    case TargetAudience.SPECIFIC_PROGRAM:
      // Get parents of students in specific program
      const parentsInProgram = await prisma.user.findMany({
        where: {
          role: UserRole.PARENT,
          students: {
            some: {
              program: announcement.targetProgram!,
              linkStatus: "APPROVED",
            },
          },
        },
        select: {
          email: true,
          name: true,
        },
      });
      return parentsInProgram;

    case TargetAudience.SPECIFIC_YEAR_LEVEL:
      // Get parents of students in specific year level
      const parentsInYearLevel = await prisma.user.findMany({
        where: {
          role: UserRole.PARENT,
          students: {
            some: {
              yearLevel: announcement.targetYearLevel!,
              linkStatus: "APPROVED",
            },
          },
        },
        select: {
          email: true,
          name: true,
        },
      });
      return parentsInYearLevel;

    default:
      break;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      email: true,
      name: true,
    },
  });

  return users;
};

// Get announcements statistics
export const getAnnouncementStats = async () => {
  const now = new Date();

  const [
    totalAnnouncements,
    publishedAnnouncements,
    unpublishedAnnouncements,
    activeAnnouncements,
    expiredAnnouncements,
    urgentAnnouncements,
    byPriority,
    byTargetAudience,
  ] = await Promise.all([
    prisma.announcement.count(),
    prisma.announcement.count({ where: { isPublished: true } }),
    prisma.announcement.count({ where: { isPublished: false } }),
    prisma.announcement.count({
      where: {
        isPublished: true,
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
      },
    }),
    prisma.announcement.count({
      where: {
        isPublished: true,
        expiryDate: { lt: now },
      },
    }),
    prisma.announcement.count({
      where: {
        priority: AnnouncementPriority.URGENT,
        isPublished: true,
      },
    }),
    prisma.announcement.groupBy({
      by: ["priority"],
      _count: true,
    }),
    prisma.announcement.groupBy({
      by: ["targetAudience"],
      _count: true,
    }),
  ]);

  return {
    totalAnnouncements,
    publishedAnnouncements,
    unpublishedAnnouncements,
    activeAnnouncements,
    expiredAnnouncements,
    urgentAnnouncements,
    byPriority: byPriority.map((item) => ({
      priority: item.priority,
      count: item._count,
    })),
    byTargetAudience: byTargetAudience.map((item) => ({
      targetAudience: item.targetAudience,
      count: item._count,
    })),
  };
};

// Mark announcement as read by a user
export const markAnnouncementAsRead = async (
  announcementId: number,
  userId: number
): Promise<void> => {
  // Check if announcement exists
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  // Create or update read status
  await prisma.announcementRead.upsert({
    where: {
      announcementId_userId: {
        announcementId,
        userId,
      },
    },
    update: {
      readAt: new Date(),
    },
    create: {
      announcementId,
      userId,
    },
  });
};

// Get unread announcement count for a user
export const getUnreadCount = async (userId: number): Promise<number> => {
  const now = new Date();

  // Get all published and active announcements
  const activeAnnouncements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
    },
    select: { id: true },
  });

  const activeAnnouncementIds = activeAnnouncements.map((a) => a.id);

  // Get read announcement IDs
  const readAnnouncements = await prisma.announcementRead.findMany({
    where: {
      userId,
      announcementId: { in: activeAnnouncementIds },
    },
    select: { announcementId: true },
  });

  const readAnnouncementIds = new Set(
    readAnnouncements.map((r) => r.announcementId)
  );

  // Count unread announcements
  const unreadCount = activeAnnouncementIds.filter(
    (id) => !readAnnouncementIds.has(id)
  ).length;

  return unreadCount;
};

// Get read status of announcements for a user
export const getMyReadStatus = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<{
  announcements: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const now = new Date();
  const skip = (page - 1) * limit;

  // Get active announcements with read status
  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
    },
    include: {
      readBy: {
        where: { userId },
        select: { readAt: true },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.announcement.count({
    where: {
      isPublished: true,
      OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
    },
  });

  const announcementsWithStatus = announcements.map((announcement) => ({
    ...announcement,
    isRead: announcement.readBy.length > 0,
    readAt: announcement.readBy[0]?.readAt || null,
    readBy: undefined, // Remove the readBy array from response
  }));

  return {
    announcements: announcementsWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
