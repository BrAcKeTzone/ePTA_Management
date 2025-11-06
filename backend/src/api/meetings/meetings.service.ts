import { Meeting, MeetingType, MeetingStatus, Prisma } from "@prisma/client";
import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";
import {
  sendMeetingNotification,
  sendMeetingReminder,
} from "../../utils/meetingNotification";

export interface MeetingSearchFilters {
  search?: string;
  meetingType?: MeetingType;
  status?: MeetingStatus;
  fromDate?: Date;
  toDate?: Date;
  year?: number;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  meetingType?: MeetingType;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  isVirtual?: boolean;
  meetingLink?: string;
  agenda?: string;
  expectedAttendees?: number;
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  meetingType?: MeetingType;
  status?: MeetingStatus;
  date?: Date;
  startTime?: string;
  endTime?: string;
  venue?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  agenda?: string;
  expectedAttendees?: number;
}

/**
 * Create a new meeting
 */
export const createMeeting = async (
  meetingData: CreateMeetingInput,
  createdById: number
): Promise<Meeting> => {
  // Validate that virtual meetings have a meeting link
  if (meetingData.isVirtual && !meetingData.meetingLink) {
    throw new ApiError(400, "Virtual meetings must have a meeting link");
  }

  // Validate end time is after start time if provided
  if (meetingData.endTime) {
    const start = meetingData.startTime.split(":").map(Number);
    const end = meetingData.endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (endMinutes <= startMinutes) {
      throw new ApiError(400, "End time must be after start time");
    }
  }

  const meeting = await prisma.meeting.create({
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

/**
 * Get meetings with filtering and pagination
 */
export const getMeetings = async (
  filters: MeetingSearchFilters,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.MeetingWhereInput = {};

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
    prisma.meeting.findMany({
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
    prisma.meeting.count({ where }),
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

/**
 * Get meeting by ID
 */
export const getMeetingById = async (id: number): Promise<Meeting> => {
  const meeting = await prisma.meeting.findUnique({
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
    throw new ApiError(404, "Meeting not found");
  }

  return meeting;
};

/**
 * Update meeting
 */
export const updateMeeting = async (
  id: number,
  updateData: UpdateMeetingInput
): Promise<Meeting> => {
  // Check if meeting exists
  const existingMeeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!existingMeeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Validate that virtual meetings have a meeting link
  if (updateData.isVirtual !== undefined && updateData.isVirtual) {
    const meetingLink = updateData.meetingLink || existingMeeting.meetingLink;
    if (!meetingLink) {
      throw new ApiError(400, "Virtual meetings must have a meeting link");
    }
  }

  // Validate end time is after start time if both are provided
  if (updateData.startTime && updateData.endTime) {
    const start = updateData.startTime.split(":").map(Number);
    const end = updateData.endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (endMinutes <= startMinutes) {
      throw new ApiError(400, "End time must be after start time");
    }
  }

  const meeting = await prisma.meeting.update({
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

/**
 * Delete meeting
 */
export const deleteMeeting = async (
  id: number
): Promise<{ message: string }> => {
  // Check if meeting exists
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      attendances: true,
      penalties: true,
    },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Check if meeting has attendances or penalties
  if (meeting.attendances.length > 0 || meeting.penalties.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete meeting with existing attendances or penalties. Consider cancelling it instead."
    );
  }

  await prisma.meeting.delete({
    where: { id },
  });

  return { message: "Meeting deleted successfully" };
};

/**
 * Add minutes to a meeting
 */
export const addMinutes = async (
  id: number,
  minutes: string,
  userId: number
): Promise<Meeting> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  if (
    meeting.status !== MeetingStatus.COMPLETED &&
    meeting.status !== MeetingStatus.ONGOING
  ) {
    throw new ApiError(
      400,
      "Minutes can only be added to ongoing or completed meetings"
    );
  }

  const updatedMeeting = await prisma.meeting.update({
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

/**
 * Add resolutions to a meeting
 */
export const addResolutions = async (
  id: number,
  resolutions: string
): Promise<Meeting> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  if (
    meeting.status !== MeetingStatus.COMPLETED &&
    meeting.status !== MeetingStatus.ONGOING
  ) {
    throw new ApiError(
      400,
      "Resolutions can only be added to ongoing or completed meetings"
    );
  }

  const updatedMeeting = await prisma.meeting.update({
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

/**
 * Update quorum for a meeting
 */
export const updateQuorum = async (
  id: number,
  actualAttendees: number
): Promise<Meeting> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Get system settings for quorum percentage
  const settings = await prisma.settings.findUnique({
    where: { key: "system_config" },
  });

  const quorumPercentageRequired = settings?.quorumPercentage || 50;

  // Calculate if quorum is reached
  const quorumPercentage =
    meeting.expectedAttendees > 0
      ? (actualAttendees / meeting.expectedAttendees) * 100
      : 0;

  const quorumReached = quorumPercentage >= quorumPercentageRequired;

  const updatedMeeting = await prisma.meeting.update({
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

/**
 * Get meeting history (past meetings)
 */
export const getMeetingHistory = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
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
    prisma.meeting.count({
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

/**
 * Get upcoming meetings
 */
export const getUpcomingMeetings = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        date: {
          gte: today,
        },
        status: {
          in: [MeetingStatus.SCHEDULED, MeetingStatus.ONGOING],
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
    prisma.meeting.count({
      where: {
        date: {
          gte: today,
        },
        status: {
          in: [MeetingStatus.SCHEDULED, MeetingStatus.ONGOING],
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

/**
 * Get meeting statistics
 */
export const getMeetingStats = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const [
    totalMeetings,
    completedMeetings,
    upcomingMeetings,
    cancelledMeetings,
    yearlyMeetings,
    meetingsWithQuorum,
    avgAttendance,
  ] = await Promise.all([
    prisma.meeting.count(),
    prisma.meeting.count({
      where: { status: MeetingStatus.COMPLETED },
    }),
    prisma.meeting.count({
      where: {
        date: { gte: new Date() },
        status: MeetingStatus.SCHEDULED,
      },
    }),
    prisma.meeting.count({
      where: { status: MeetingStatus.CANCELLED },
    }),
    prisma.meeting.count({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    prisma.meeting.count({
      where: { quorumReached: true },
    }),
    prisma.meeting.aggregate({
      _avg: {
        actualAttendees: true,
      },
    }),
  ]);

  // Get meetings by type
  const meetingsByType = await prisma.meeting.groupBy({
    by: ["meetingType"],
    _count: true,
  });

  // Get meetings by status
  const meetingsByStatus = await prisma.meeting.groupBy({
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
    }, {} as Record<string, number>),
    byStatus: meetingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};

/**
 * Send meeting notifications to members
 */
export const sendMeetingNotifications = async (
  meetingId: number,
  targetAudience: "ALL" | "PARENTS" | "ADMINS" = "ALL",
  customMessage?: string
): Promise<{ sent: number; failed: number }> => {
  const meeting = await getMeetingById(meetingId);

  // Get recipients based on target audience
  const whereClause: any = { isActive: true };

  if (targetAudience === "PARENTS") {
    whereClause.role = "PARENT";
  } else if (targetAudience === "ADMINS") {
    whereClause.role = "ADMIN";
  }

  const recipients = await prisma.user.findMany({
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

    const results = await Promise.allSettled(
      batch.map((recipient) =>
        sendMeetingNotification(
          recipient.email,
          `${recipient.firstName} ${recipient.lastName}`,
          meeting,
          customMessage
        )
      )
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
      }
    });

    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Update notification sent status
  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      notificationSent: true,
      notificationSentAt: new Date(),
    },
  });

  return { sent, failed };
};

/**
 * Cancel a meeting
 */
export const cancelMeeting = async (
  id: number,
  reason?: string
): Promise<Meeting> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  if (meeting.status === MeetingStatus.COMPLETED) {
    throw new ApiError(400, "Cannot cancel a completed meeting");
  }

  if (meeting.status === MeetingStatus.CANCELLED) {
    throw new ApiError(400, "Meeting is already cancelled");
  }

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data: {
      status: MeetingStatus.CANCELLED,
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
