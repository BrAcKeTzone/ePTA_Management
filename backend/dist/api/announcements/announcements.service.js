"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReadStatus = exports.getUnreadCount = exports.markAnnouncementAsRead = exports.getAnnouncementStats = exports.unpublishAnnouncement = exports.publishAnnouncement = exports.deleteAnnouncement = exports.updateAnnouncement = exports.getAnnouncementById = exports.getActiveAnnouncements = exports.getAnnouncements = exports.createAnnouncement = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const announcementNotification_1 = require("../../utils/announcementNotification");
// Create a new announcement
const createAnnouncement = async (data) => {
    // Validate creator exists and is admin
    const creator = await prisma_1.default.user.findUnique({
        where: { id: data.createdById },
    });
    if (!creator) {
        throw new ApiError_1.default(404, "Creator not found");
    }
    if (creator.role !== client_1.UserRole.ADMIN) {
        throw new ApiError_1.default(403, "Only admins can create announcements");
    }
    // Validate target audience logic
    if (data.targetAudience === client_1.TargetAudience.SPECIFIC_PROGRAM &&
        !data.targetProgram) {
        throw new ApiError_1.default(400, "Target program is required for SPECIFIC_PROGRAM audience");
    }
    if (data.targetAudience === client_1.TargetAudience.SPECIFIC_YEAR_LEVEL &&
        !data.targetYearLevel) {
        throw new ApiError_1.default(400, "Target year level is required for SPECIFIC_YEAR_LEVEL audience");
    }
    // Validate dates
    if (data.publishDate &&
        data.expiryDate &&
        data.expiryDate <= data.publishDate) {
        throw new ApiError_1.default(400, "Expiry date must be after publish date");
    }
    const announcement = await prisma_1.default.announcement.create({
        data: {
            title: data.title,
            content: data.content,
            priority: data.priority || client_1.AnnouncementPriority.MEDIUM,
            targetAudience: data.targetAudience || client_1.TargetAudience.ALL,
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
exports.createAnnouncement = createAnnouncement;
// Get all announcements with filters and pagination
const getAnnouncements = async (filter) => {
    const { search, priority, targetAudience, isPublished, createdById, page = 1, limit = 10, } = filter;
    const skip = (page - 1) * limit;
    const whereClause = {};
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
        prisma_1.default.announcement.findMany({
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
        prisma_1.default.announcement.count({ where: whereClause }),
    ]);
    return {
        announcements,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
    };
};
exports.getAnnouncements = getAnnouncements;
// Get active announcements (published and not expired)
const getActiveAnnouncements = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const now = new Date();
    const whereClause = {
        isPublished: true,
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
    };
    const [announcements, totalCount] = await Promise.all([
        prisma_1.default.announcement.findMany({
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
        prisma_1.default.announcement.count({ where: whereClause }),
    ]);
    return {
        announcements,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
    };
};
exports.getActiveAnnouncements = getActiveAnnouncements;
// Get announcement by ID
const getAnnouncementById = async (id) => {
    const announcement = await prisma_1.default.announcement.findUnique({
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
        throw new ApiError_1.default(404, "Announcement not found");
    }
    return announcement;
};
exports.getAnnouncementById = getAnnouncementById;
// Update announcement
const updateAnnouncement = async (id, data) => {
    const announcement = await prisma_1.default.announcement.findUnique({
        where: { id },
    });
    if (!announcement) {
        throw new ApiError_1.default(404, "Announcement not found");
    }
    // Validate target audience logic
    const targetAudience = data.targetAudience || announcement.targetAudience;
    if (targetAudience === client_1.TargetAudience.SPECIFIC_PROGRAM) {
        const targetProgram = data.targetProgram !== undefined
            ? data.targetProgram
            : announcement.targetProgram;
        if (!targetProgram) {
            throw new ApiError_1.default(400, "Target program is required for SPECIFIC_PROGRAM audience");
        }
    }
    if (targetAudience === client_1.TargetAudience.SPECIFIC_YEAR_LEVEL) {
        const targetYearLevel = data.targetYearLevel !== undefined
            ? data.targetYearLevel
            : announcement.targetYearLevel;
        if (!targetYearLevel) {
            throw new ApiError_1.default(400, "Target year level is required for SPECIFIC_YEAR_LEVEL audience");
        }
    }
    const updatedAnnouncement = await prisma_1.default.announcement.update({
        where: { id },
        data,
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
exports.updateAnnouncement = updateAnnouncement;
// Delete announcement
const deleteAnnouncement = async (id) => {
    const announcement = await prisma_1.default.announcement.findUnique({
        where: { id },
    });
    if (!announcement) {
        throw new ApiError_1.default(404, "Announcement not found");
    }
    await prisma_1.default.announcement.delete({
        where: { id },
    });
};
exports.deleteAnnouncement = deleteAnnouncement;
// Publish announcement and send notifications
const publishAnnouncement = async (id, publishDate, sendNotifications = true) => {
    const announcement = await prisma_1.default.announcement.findUnique({
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
        throw new ApiError_1.default(404, "Announcement not found");
    }
    if (announcement.isPublished) {
        throw new ApiError_1.default(400, "Announcement is already published");
    }
    // Update announcement to published
    const updatedAnnouncement = await prisma_1.default.announcement.update({
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
            notificationResult = await (0, announcementNotification_1.sendAnnouncementNotifications)({
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
exports.publishAnnouncement = publishAnnouncement;
// Unpublish announcement
const unpublishAnnouncement = async (id) => {
    const announcement = await prisma_1.default.announcement.findUnique({
        where: { id },
    });
    if (!announcement) {
        throw new ApiError_1.default(404, "Announcement not found");
    }
    if (!announcement.isPublished) {
        throw new ApiError_1.default(400, "Announcement is not published");
    }
    const updatedAnnouncement = await prisma_1.default.announcement.update({
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
exports.unpublishAnnouncement = unpublishAnnouncement;
// Helper function to get targeted recipients based on announcement audience
const getTargetedRecipients = async (announcement) => {
    let whereClause = {};
    switch (announcement.targetAudience) {
        case client_1.TargetAudience.ALL:
            // Send to all users (both admins and parents)
            break;
        case client_1.TargetAudience.PARENTS:
            whereClause.role = client_1.UserRole.PARENT;
            break;
        case client_1.TargetAudience.ADMINS:
            whereClause.role = client_1.UserRole.ADMIN;
            break;
        case client_1.TargetAudience.SPECIFIC_PROGRAM:
            // Get parents of students in specific program
            const parentsInProgram = await prisma_1.default.user.findMany({
                where: {
                    role: client_1.UserRole.PARENT,
                    students: {
                        some: {
                            program: announcement.targetProgram,
                            linkStatus: "APPROVED",
                        },
                    },
                },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                },
            });
            return parentsInProgram;
        case client_1.TargetAudience.SPECIFIC_YEAR_LEVEL:
            // Get parents of students in specific year level
            const parentsInYearLevel = await prisma_1.default.user.findMany({
                where: {
                    role: client_1.UserRole.PARENT,
                    students: {
                        some: {
                            yearLevel: announcement.targetYearLevel,
                            linkStatus: "APPROVED",
                        },
                    },
                },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                },
            });
            return parentsInYearLevel;
        default:
            break;
    }
    const users = await prisma_1.default.user.findMany({
        where: whereClause,
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
const getAnnouncementStats = async () => {
    const now = new Date();
    const [totalAnnouncements, publishedAnnouncements, unpublishedAnnouncements, activeAnnouncements, expiredAnnouncements, urgentAnnouncements, byPriority, byTargetAudience,] = await Promise.all([
        prisma_1.default.announcement.count(),
        prisma_1.default.announcement.count({ where: { isPublished: true } }),
        prisma_1.default.announcement.count({ where: { isPublished: false } }),
        prisma_1.default.announcement.count({
            where: {
                isPublished: true,
                OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
            },
        }),
        prisma_1.default.announcement.count({
            where: {
                isPublished: true,
                expiryDate: { lt: now },
            },
        }),
        prisma_1.default.announcement.count({
            where: {
                priority: client_1.AnnouncementPriority.URGENT,
                isPublished: true,
            },
        }),
        prisma_1.default.announcement.groupBy({
            by: ["priority"],
            _count: true,
        }),
        prisma_1.default.announcement.groupBy({
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
exports.getAnnouncementStats = getAnnouncementStats;
// Mark announcement as read by a user
const markAnnouncementAsRead = async (announcementId, userId) => {
    // Check if announcement exists
    const announcement = await prisma_1.default.announcement.findUnique({
        where: { id: announcementId },
    });
    if (!announcement) {
        throw new ApiError_1.default(404, "Announcement not found");
    }
    // Create or update read status
    await prisma_1.default.announcementRead.upsert({
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
exports.markAnnouncementAsRead = markAnnouncementAsRead;
// Get unread announcement count for a user
const getUnreadCount = async (userId) => {
    const now = new Date();
    // Get all published and active announcements
    const activeAnnouncements = await prisma_1.default.announcement.findMany({
        where: {
            isPublished: true,
            OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
        },
        select: { id: true },
    });
    const activeAnnouncementIds = activeAnnouncements.map((a) => a.id);
    // Get read announcement IDs
    const readAnnouncements = await prisma_1.default.announcementRead.findMany({
        where: {
            userId,
            announcementId: { in: activeAnnouncementIds },
        },
        select: { announcementId: true },
    });
    const readAnnouncementIds = new Set(readAnnouncements.map((r) => r.announcementId));
    // Count unread announcements
    const unreadCount = activeAnnouncementIds.filter((id) => !readAnnouncementIds.has(id)).length;
    return unreadCount;
};
exports.getUnreadCount = getUnreadCount;
// Get read status of announcements for a user
const getMyReadStatus = async (userId, page = 1, limit = 10) => {
    const now = new Date();
    const skip = (page - 1) * limit;
    // Get active announcements with read status
    const announcements = await prisma_1.default.announcement.findMany({
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
    const total = await prisma_1.default.announcement.count({
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
exports.getMyReadStatus = getMyReadStatus;
//# sourceMappingURL=announcements.service.js.map