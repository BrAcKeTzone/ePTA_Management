import prisma from "../../configs/prisma";
import { Announcement, AnnouncementPriority, UserRole } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { sendAnnouncementNotifications } from "../../utils/announcementNotification";

interface CreateAnnouncementData {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  isPublished?: boolean;
  publishDate?: Date;
  expiryDate?: Date;
  createdById: number;
}

interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  isPublished?: boolean;
  publishDate?: Date | null;
  expiryDate?: Date | null;
}

interface GetAnnouncementsFilter {
  search?: string;
  priority?: AnnouncementPriority;
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
      isPublished: data.isPublished || false,
      publishDate: data.isPublished ? data.publishDate || new Date() : null,
      expiryDate: data.expiryDate || null,
      createdById: data.createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
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
            firstName: true,
            lastName: true,
            middleName: true,
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
    isArchived: false,
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
            firstName: true,
            lastName: true,
            middleName: true,
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
          firstName: true,
          lastName: true,
          middleName: true,
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

  // Extract only allowed fields for update
  const updateData: UpdateAnnouncementData = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
  };

  // If changing from unpublished to published, set publishDate
  if (data.isPublished === true && !announcement.isPublished) {
    updateData.publishDate = data.publishDate || new Date();
  } else if (data.isPublished === false && announcement.isPublished) {
    // If unpublishing, clear publishDate
    updateData.publishDate = null;
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
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
          firstName: true,
          lastName: true,
          middleName: true,
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
          firstName: true,
          lastName: true,
          middleName: true,
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
          firstName: true,
          lastName: true,
          middleName: true,
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
): Promise<
  Array<{
    email: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
  }>
> => {
  // Send to all parents
  const users = await prisma.user.findMany({
    where: {
      role: UserRole.PARENT,
    },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      middleName: true,
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
          firstName: true,
          lastName: true,
          middleName: true,
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

// Toggle featured status
export const toggleFeatured = async (id: number): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return await prisma.announcement.update({
    where: { id },
    data: { isFeatured: !announcement.isFeatured },
  });
};

// Toggle publish status
export const togglePublish = async (id: number): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  const willBePublished = !announcement.isPublished;

  return await prisma.announcement.update({
    where: { id },
    data: {
      isPublished: willBePublished,
      publishDate: willBePublished ? new Date() : null, // Set publishDate when publishing
    },
  });
};

// Archive announcement
export const archiveAnnouncement = async (
  id: number
): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return await prisma.announcement.update({
    where: { id },
    data: { isArchived: true },
  });
};

// Unarchive announcement
export const unarchiveAnnouncement = async (
  id: number
): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return await prisma.announcement.update({
    where: { id },
    data: { isArchived: false },
  });
};
