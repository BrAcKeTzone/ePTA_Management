"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMeeting = exports.sendMeetingNotifications = exports.getMeetingStats = exports.getUpcomingMeetings = exports.getMeetingHistory = exports.updateQuorum = exports.addResolutions = exports.addMinutes = exports.deleteMeeting = exports.updateMeeting = exports.getMeetingById = exports.getMeetings = exports.createMeeting = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../configs/prisma"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const meetingNotification_1 = require("../../utils/meetingNotification");
/**
 * Create a new meeting
 */
const createMeeting = async (meetingData, createdById) => {
    // Validate that virtual meetings have a meeting link
    if (meetingData.isVirtual && !meetingData.meetingLink) {
        throw new ApiError_1.default(400, "Virtual meetings must have a meeting link");
    }
    // Validate end time is after start time if provided
    if (meetingData.endTime) {
        const start = meetingData.startTime.split(":").map(Number);
        const end = meetingData.endTime.split(":").map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        if (endMinutes <= startMinutes) {
            throw new ApiError_1.default(400, "End time must be after start time");
        }
    }
    const meeting = await prisma_1.default.meeting.create({
        data: {
            ...meetingData,
            createdById,
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
    return meeting;
};
exports.createMeeting = createMeeting;
/**
 * Get meetings with filtering and pagination
 */
const getMeetings = async (filters, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    // Build where clause
    const where = {};
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { venue: { contains: filters.search } },
        ];
    }
    if (filters.meetingType) {
        where.meetingType = filters.meetingType;
    }
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.fromDate || filters.toDate) {
        where.date = {};
        if (filters.fromDate) {
            where.date.gte = filters.fromDate;
        }
        if (filters.toDate) {
            where.date.lte = filters.toDate;
        }
    }
    if (filters.year) {
        const startOfYear = new Date(filters.year, 0, 1);
        const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59);
        where.date = {
            gte: startOfYear,
            lte: endOfYear,
        };
    }
    // Execute query
    const [meetings, total] = await Promise.all([
        prisma_1.default.meeting.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                date: "desc",
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
                attendances: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        attendances: true,
                        attachments: true,
                    },
                },
            },
        }),
        prisma_1.default.meeting.count({ where }),
    ]);
    return {
        meetings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getMeetings = getMeetings;
/**
 * Get meeting by ID
 */
const getMeetingById = async (id) => {
    const meeting = await prisma_1.default.meeting.findUnique({
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
            attendances: {
                include: {
                    parent: {
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
            },
            attachments: true,
            _count: {
                select: {
                    attendances: true,
                    penalties: true,
                    attachments: true,
                },
            },
        },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    return meeting;
};
exports.getMeetingById = getMeetingById;
/**
 * Update meeting
 */
const updateMeeting = async (id, updateData) => {
    // Check if meeting exists
    const existingMeeting = await prisma_1.default.meeting.findUnique({
        where: { id },
    });
    if (!existingMeeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    // Validate that virtual meetings have a meeting link
    if (updateData.isVirtual !== undefined && updateData.isVirtual) {
        const meetingLink = updateData.meetingLink || existingMeeting.meetingLink;
        if (!meetingLink) {
            throw new ApiError_1.default(400, "Virtual meetings must have a meeting link");
        }
    }
    // Validate end time is after start time if both are provided
    if (updateData.startTime && updateData.endTime) {
        const start = updateData.startTime.split(":").map(Number);
        const end = updateData.endTime.split(":").map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        if (endMinutes <= startMinutes) {
            throw new ApiError_1.default(400, "End time must be after start time");
        }
    }
    const meeting = await prisma_1.default.meeting.update({
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
            attendances: {
                select: {
                    id: true,
                    status: true,
                },
            },
            _count: {
                select: {
                    attendances: true,
                    attachments: true,
                },
            },
        },
    });
    return meeting;
};
exports.updateMeeting = updateMeeting;
/**
 * Delete meeting
 */
const deleteMeeting = async (id) => {
    // Check if meeting exists
    const meeting = await prisma_1.default.meeting.findUnique({
        where: { id },
        include: {
            attendances: true,
            penalties: true,
        },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    // Check if meeting has attendances or penalties
    if (meeting.attendances.length > 0 || meeting.penalties.length > 0) {
        throw new ApiError_1.default(400, "Cannot delete meeting with existing attendances or penalties. Consider cancelling it instead.");
    }
    await prisma_1.default.meeting.delete({
        where: { id },
    });
    return { message: "Meeting deleted successfully" };
};
exports.deleteMeeting = deleteMeeting;
/**
 * Add minutes to a meeting
 */
const addMinutes = async (id, minutes, userId) => {
    const meeting = await prisma_1.default.meeting.findUnique({
        where: { id },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    if (meeting.status !== client_1.MeetingStatus.COMPLETED &&
        meeting.status !== client_1.MeetingStatus.ONGOING) {
        throw new ApiError_1.default(400, "Minutes can only be added to ongoing or completed meetings");
    }
    const updatedMeeting = await prisma_1.default.meeting.update({
        where: { id },
        data: {
            minutes,
            minutesAddedAt: new Date(),
            minutesAddedBy: userId,
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
    return updatedMeeting;
};
exports.addMinutes = addMinutes;
/**
 * Add resolutions to a meeting
 */
const addResolutions = async (id, resolutions) => {
    const meeting = await prisma_1.default.meeting.findUnique({
        where: { id },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    if (meeting.status !== client_1.MeetingStatus.COMPLETED &&
        meeting.status !== client_1.MeetingStatus.ONGOING) {
        throw new ApiError_1.default(400, "Resolutions can only be added to ongoing or completed meetings");
    }
    const updatedMeeting = await prisma_1.default.meeting.update({
        where: { id },
        data: {
            resolutions,
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
    return updatedMeeting;
};
exports.addResolutions = addResolutions;
/**
 * Update quorum for a meeting
 */
const updateQuorum = async (id, actualAttendees) => {
    const meeting = await prisma_1.default.meeting.findUnique({
        where: { id },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    // Get system settings for quorum percentage
    const settings = await prisma_1.default.settings.findUnique({
        where: { key: "system_config" },
    });
    const quorumPercentageRequired = settings?.quorumPercentage || 50;
    // Calculate if quorum is reached
    const quorumPercentage = meeting.expectedAttendees > 0
        ? (actualAttendees / meeting.expectedAttendees) * 100
        : 0;
    const quorumReached = quorumPercentage >= quorumPercentageRequired;
    const updatedMeeting = await prisma_1.default.meeting.update({
        where: { id },
        data: {
            actualAttendees,
            quorumPercentage,
            quorumReached,
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
    return updatedMeeting;
};
exports.updateQuorum = updateQuorum;
/**
 * Get meeting history (past meetings)
 */
const getMeetingHistory = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [meetings, total] = await Promise.all([
        prisma_1.default.meeting.findMany({
            where: {
                date: {
                    lt: today,
                },
            },
            skip,
            take: limit,
            orderBy: {
                date: "desc",
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
                _count: {
                    select: {
                        attendances: true,
                        attachments: true,
                    },
                },
            },
        }),
        prisma_1.default.meeting.count({
            where: {
                date: {
                    lt: today,
                },
            },
        }),
    ]);
    return {
        meetings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getMeetingHistory = getMeetingHistory;
/**
 * Get upcoming meetings
 */
const getUpcomingMeetings = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [meetings, total] = await Promise.all([
        prisma_1.default.meeting.findMany({
            where: {
                date: {
                    gte: today,
                },
                status: {
                    in: [client_1.MeetingStatus.SCHEDULED, client_1.MeetingStatus.ONGOING],
                },
            },
            skip,
            take: limit,
            orderBy: {
                date: "asc",
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
                _count: {
                    select: {
                        attendances: true,
                        attachments: true,
                    },
                },
            },
        }),
        prisma_1.default.meeting.count({
            where: {
                date: {
                    gte: today,
                },
                status: {
                    in: [client_1.MeetingStatus.SCHEDULED, client_1.MeetingStatus.ONGOING],
                },
            },
        }),
    ]);
    return {
        meetings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getUpcomingMeetings = getUpcomingMeetings;
/**
 * Get meeting statistics
 */
const getMeetingStats = async () => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    const [totalMeetings, completedMeetings, upcomingMeetings, cancelledMeetings, yearlyMeetings, meetingsWithQuorum, avgAttendance,] = await Promise.all([
        prisma_1.default.meeting.count(),
        prisma_1.default.meeting.count({
            where: { status: client_1.MeetingStatus.COMPLETED },
        }),
        prisma_1.default.meeting.count({
            where: {
                date: { gte: new Date() },
                status: client_1.MeetingStatus.SCHEDULED,
            },
        }),
        prisma_1.default.meeting.count({
            where: { status: client_1.MeetingStatus.CANCELLED },
        }),
        prisma_1.default.meeting.count({
            where: {
                date: {
                    gte: startOfYear,
                    lte: endOfYear,
                },
            },
        }),
        prisma_1.default.meeting.count({
            where: { quorumReached: true },
        }),
        prisma_1.default.meeting.aggregate({
            _avg: {
                actualAttendees: true,
            },
        }),
    ]);
    // Get meetings by type
    const meetingsByType = await prisma_1.default.meeting.groupBy({
        by: ["meetingType"],
        _count: true,
    });
    // Get meetings by status
    const meetingsByStatus = await prisma_1.default.meeting.groupBy({
        by: ["status"],
        _count: true,
    });
    return {
        total: totalMeetings,
        completed: completedMeetings,
        upcoming: upcomingMeetings,
        cancelled: cancelledMeetings,
        thisYear: yearlyMeetings,
        withQuorum: meetingsWithQuorum,
        averageAttendance: Math.round(avgAttendance._avg.actualAttendees || 0),
        byType: meetingsByType.reduce((acc, item) => {
            acc[item.meetingType] = item._count;
            return acc;
        }, {}),
        byStatus: meetingsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {}),
    };
};
exports.getMeetingStats = getMeetingStats;
/**
 * Send meeting notifications to members
 */
const sendMeetingNotifications = async (meetingId, targetAudience = "ALL", customMessage) => {
    const meeting = await (0, exports.getMeetingById)(meetingId);
    // Get recipients based on target audience
    const whereClause = { isActive: true };
    if (targetAudience === "PARENTS") {
        whereClause.role = "PARENT";
    }
    else if (targetAudience === "ADMINS") {
        whereClause.role = "ADMIN";
    }
    const recipients = await prisma_1.default.user.findMany({
        where: whereClause,
        select: {
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
        },
    });
    let sent = 0;
    let failed = 0;
    // Send notifications in batches
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map((recipient) => (0, meetingNotification_1.sendMeetingNotification)(recipient.email, `${recipient.firstName} ${recipient.lastName}`, meeting, customMessage)));
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                sent++;
            }
            else {
                failed++;
            }
        });
        // Small delay between batches
        if (i + batchSize < recipients.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    // Update notification sent status
    await prisma_1.default.meeting.update({
        where: { id: meetingId },
        data: {
            notificationSent: true,
            notificationSentAt: new Date(),
        },
    });
    return { sent, failed };
};
exports.sendMeetingNotifications = sendMeetingNotifications;
/**
 * Cancel a meeting
 */
const cancelMeeting = async (id, reason) => {
    const meeting = await prisma_1.default.meeting.findUnique({
        where: { id },
    });
    if (!meeting) {
        throw new ApiError_1.default(404, "Meeting not found");
    }
    if (meeting.status === client_1.MeetingStatus.COMPLETED) {
        throw new ApiError_1.default(400, "Cannot cancel a completed meeting");
    }
    if (meeting.status === client_1.MeetingStatus.CANCELLED) {
        throw new ApiError_1.default(400, "Meeting is already cancelled");
    }
    const updatedMeeting = await prisma_1.default.meeting.update({
        where: { id },
        data: {
            status: client_1.MeetingStatus.CANCELLED,
            description: reason
                ? `${meeting.description || ""}\n\n[CANCELLED]: ${reason}`
                : meeting.description,
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
    return updatedMeeting;
};
exports.cancelMeeting = cancelMeeting;
//# sourceMappingURL=meetings.service.js.map