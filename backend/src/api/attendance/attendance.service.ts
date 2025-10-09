import { PrismaClient, AttendanceStatus, Prisma } from "@prisma/client";
import ApiError from "../../utils/ApiError";

const prisma = new PrismaClient();

interface RecordAttendanceInput {
  meetingId: number;
  parentId: number;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  isLate?: boolean;
  lateMinutes?: number;
  remarks?: string;
  excuseReason?: string;
}

interface BulkAttendanceInput {
  meetingId: number;
  attendances: {
    parentId: number;
    status: AttendanceStatus;
    checkInTime?: Date;
    checkOutTime?: Date;
    isLate?: boolean;
    lateMinutes?: number;
    remarks?: string;
    excuseReason?: string;
  }[];
}

interface AttendanceFilters {
  meetingId?: number;
  parentId?: number;
  status?: AttendanceStatus;
  hasPenalty?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "checkInTime" | "status";
  sortOrder?: "asc" | "desc";
}

interface AttendanceReportFilters {
  meetingId?: number;
  parentId?: number;
  dateFrom: Date;
  dateTo: Date;
  includeStats?: boolean;
  groupBy?: "meeting" | "parent" | "status";
}

interface PenaltyCalculationInput {
  meetingId?: number;
  parentId?: number;
  applyPenalties?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Record attendance for a single parent in a meeting
 */
export const recordAttendance = async (
  data: RecordAttendanceInput,
  recordedById: number
) => {
  // Verify meeting exists
  const meeting = await prisma.meeting.findUnique({
    where: { id: data.meetingId },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Verify parent exists and has PARENT role
  const parent = await prisma.user.findUnique({
    where: { id: data.parentId },
  });

  if (!parent) {
    throw new ApiError(404, "Parent not found");
  }

  if (parent.role !== "PARENT") {
    throw new ApiError(400, "User is not a parent");
  }

  // Check if attendance already recorded
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      meetingId_parentId: {
        meetingId: data.meetingId,
        parentId: data.parentId,
      },
    },
  });

  if (existingAttendance) {
    throw new ApiError(
      400,
      "Attendance already recorded for this parent in this meeting"
    );
  }

  // Get system settings for penalty calculation
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  // Calculate penalty if applicable
  let penaltyAmount: number | undefined = undefined;
  let hasPenalty = false;

  if (settings && settings.enableAutoPenalty) {
    if (data.status === "ABSENT") {
      penaltyAmount = settings.penaltyRatePerAbsence;
      hasPenalty = true;
    } else if (data.status === "PRESENT" && data.isLate) {
      penaltyAmount = settings.penaltyRateLate;
      hasPenalty = true;
    }
  }

  // Create attendance record
  const attendance = await prisma.attendance.create({
    data: {
      meetingId: data.meetingId,
      parentId: data.parentId,
      recordedById,
      status: data.status,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      isLate: data.isLate || false,
      lateMinutes: data.lateMinutes || 0,
      remarks: data.remarks,
      excuseReason: data.excuseReason,
      hasPenalty,
      penaltyAmount,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
        },
      },
      recordedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return attendance;
};

/**
 * Record attendance for multiple parents in bulk
 */
export const bulkRecordAttendance = async (
  data: BulkAttendanceInput,
  recordedById: number
) => {
  // Verify meeting exists
  const meeting = await prisma.meeting.findUnique({
    where: { id: data.meetingId },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Get all parent IDs
  const parentIds = data.attendances.map((a) => a.parentId);

  // Verify all parents exist and have PARENT role
  const parents = await prisma.user.findMany({
    where: {
      id: { in: parentIds },
      role: "PARENT",
    },
  });

  if (parents.length !== parentIds.length) {
    throw new ApiError(400, "Some parent IDs are invalid or not parents");
  }

  // Check for existing attendance records
  const existingAttendances = await prisma.attendance.findMany({
    where: {
      meetingId: data.meetingId,
      parentId: { in: parentIds },
    },
  });

  if (existingAttendances.length > 0) {
    const existingParentIds = existingAttendances.map((a) => a.parentId);
    throw new ApiError(
      400,
      `Attendance already recorded for parent IDs: ${existingParentIds.join(
        ", "
      )}`
    );
  }

  // Get system settings for penalty calculation
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  // Prepare attendance records with penalty calculation
  const attendanceRecords = data.attendances.map((record) => {
    let penaltyAmount: number | undefined = undefined;
    let hasPenalty = false;

    if (settings && settings.enableAutoPenalty) {
      if (record.status === "ABSENT") {
        penaltyAmount = settings.penaltyRatePerAbsence;
        hasPenalty = true;
      } else if (record.status === "PRESENT" && record.isLate) {
        penaltyAmount = settings.penaltyRateLate;
        hasPenalty = true;
      }
    }

    return {
      meetingId: data.meetingId,
      parentId: record.parentId,
      recordedById,
      status: record.status,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      isLate: record.isLate || false,
      lateMinutes: record.lateMinutes || 0,
      remarks: record.remarks,
      excuseReason: record.excuseReason,
      hasPenalty,
      penaltyAmount,
    };
  });

  // Create all attendance records in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const attendances = await tx.attendance.createMany({
      data: attendanceRecords,
    });

    // Fetch the created records with relations
    const createdAttendances = await tx.attendance.findMany({
      where: {
        meetingId: data.meetingId,
        parentId: { in: parentIds },
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      count: attendances.count,
      attendances: createdAttendances,
    };
  });

  return result;
};

/**
 * Get attendance records with filters and pagination
 */
export const getAttendance = async (filters: AttendanceFilters) => {
  const {
    meetingId,
    parentId,
    status,
    hasPenalty,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Build where clause
  const where: Prisma.AttendanceWhereInput = {};

  if (meetingId) {
    where.meetingId = meetingId;
  }

  if (parentId) {
    where.parentId = parentId;
  }

  if (status) {
    where.status = status;
  }

  if (hasPenalty !== undefined) {
    where.hasPenalty = hasPenalty;
  }

  if (dateFrom || dateTo) {
    const dateFilter: any = {};

    if (dateFrom) {
      dateFilter.gte = dateFrom;
    }

    if (dateTo) {
      dateFilter.lte = dateTo;
    }

    where.meeting = {
      date: dateFilter,
    };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.attendance.count({ where });

  // Get attendance records
  const attendances = await prisma.attendance.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
          endTime: true,
          venue: true,
          meetingType: true,
          status: true,
        },
      },
      recordedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    attendances,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = async (id: number) => {
  const attendance = await prisma.attendance.findUnique({
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
      meeting: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          startTime: true,
          endTime: true,
          venue: true,
          meetingType: true,
          status: true,
        },
      },
      recordedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  return attendance;
};

/**
 * Update attendance record
 */
export const updateAttendance = async (
  id: number,
  data: Partial<RecordAttendanceInput>
) => {
  // Check if attendance exists
  const existingAttendance = await prisma.attendance.findUnique({
    where: { id },
    include: {
      meeting: true,
    },
  });

  if (!existingAttendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Get system settings for penalty recalculation
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  // Recalculate penalty if status changes
  let penaltyAmount = existingAttendance.penaltyAmount;
  let hasPenalty = existingAttendance.hasPenalty;

  if (data.status && settings && settings.enableAutoPenalty) {
    if (data.status === "ABSENT") {
      penaltyAmount = settings.penaltyRatePerAbsence;
      hasPenalty = true;
    } else if (
      data.status === "PRESENT" &&
      (data.isLate || existingAttendance.isLate)
    ) {
      penaltyAmount = settings.penaltyRateLate;
      hasPenalty = true;
    } else if (data.status === "EXCUSED") {
      penaltyAmount = null;
      hasPenalty = false;
    }
  }

  // Update attendance
  const attendance = await prisma.attendance.update({
    where: { id },
    data: {
      ...data,
      hasPenalty,
      penaltyAmount,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
        },
      },
      recordedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return attendance;
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (id: number) => {
  // Check if attendance exists
  const attendance = await prisma.attendance.findUnique({
    where: { id },
  });

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Check if penalties have been applied
  if (attendance.penaltyApplied) {
    throw new ApiError(
      400,
      "Cannot delete attendance record - penalties have already been applied"
    );
  }

  await prisma.attendance.delete({
    where: { id },
  });

  return { message: "Attendance record deleted successfully" };
};

/**
 * Generate attendance report
 */
export const generateAttendanceReport = async (
  filters: AttendanceReportFilters
) => {
  const {
    meetingId,
    parentId,
    dateFrom,
    dateTo,
    includeStats = true,
    groupBy,
  } = filters;

  // Build where clause
  const where: Prisma.AttendanceWhereInput = {
    meeting: {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  };

  if (meetingId) {
    where.meetingId = meetingId;
  }

  if (parentId) {
    where.parentId = parentId;
  }

  // Get all attendance records
  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
          venue: true,
          meetingType: true,
        },
      },
    },
    orderBy: {
      meeting: {
        date: "asc",
      },
    },
  });

  let report: any = {
    dateRange: {
      from: dateFrom,
      to: dateTo,
    },
    totalRecords: attendances.length,
    attendances,
  };

  // Calculate statistics if requested
  if (includeStats) {
    const stats = {
      totalPresent: attendances.filter((a) => a.status === "PRESENT").length,
      totalAbsent: attendances.filter((a) => a.status === "ABSENT").length,
      totalExcused: attendances.filter((a) => a.status === "EXCUSED").length,
      totalLate: attendances.filter((a) => a.isLate).length,
      totalWithPenalty: attendances.filter((a) => a.hasPenalty).length,
      totalPenaltyAmount: attendances
        .filter((a) => a.penaltyAmount)
        .reduce((sum, a) => sum + (a.penaltyAmount || 0), 0),
      attendanceRate:
        attendances.length > 0
          ? (
              (attendances.filter((a) => a.status === "PRESENT").length /
                attendances.length) *
              100
            ).toFixed(2)
          : 0,
    };
    report.statistics = stats;
  }

  // Group data if requested
  if (groupBy) {
    if (groupBy === "meeting") {
      const grouped = attendances.reduce((acc: any, curr) => {
        const key = curr.meetingId;
        if (!acc[key]) {
          acc[key] = {
            meeting: curr.meeting,
            attendances: [],
          };
        }
        acc[key].attendances.push(curr);
        return acc;
      }, {});
      report.groupedData = Object.values(grouped);
    } else if (groupBy === "parent") {
      const grouped = attendances.reduce((acc: any, curr) => {
        const key = curr.parentId;
        if (!acc[key]) {
          acc[key] = {
            parent: curr.parent,
            attendances: [],
          };
        }
        acc[key].attendances.push(curr);
        return acc;
      }, {});
      report.groupedData = Object.values(grouped);
    } else if (groupBy === "status") {
      const grouped = attendances.reduce((acc: any, curr) => {
        const key = curr.status;
        if (!acc[key]) {
          acc[key] = {
            status: key,
            attendances: [],
          };
        }
        acc[key].attendances.push(curr);
        return acc;
      }, {});
      report.groupedData = Object.values(grouped);
    }
  }

  return report;
};

/**
 * Calculate penalties for attendance records
 */
export const calculatePenalties = async (input: PenaltyCalculationInput) => {
  const {
    meetingId,
    parentId,
    applyPenalties = false,
    dateFrom,
    dateTo,
  } = input;

  // Get system settings
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!settings) {
    throw new ApiError(500, "System settings not found");
  }

  if (!settings.enableAutoPenalty) {
    throw new ApiError(
      400,
      "Auto penalty calculation is disabled in system settings"
    );
  }

  // Build where clause
  const where: Prisma.AttendanceWhereInput = {
    hasPenalty: true,
    penaltyApplied: false,
  };

  if (meetingId) {
    where.meetingId = meetingId;
  }

  if (parentId) {
    where.parentId = parentId;
  }

  if (dateFrom || dateTo) {
    const dateFilter: any = {};

    if (dateFrom) {
      dateFilter.gte = dateFrom;
    }

    if (dateTo) {
      dateFilter.lte = dateTo;
    }

    where.meeting = {
      date: dateFilter,
    };
  }

  // Get attendance records with penalties
  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
        },
      },
    },
  });

  if (attendances.length === 0) {
    return {
      message: "No penalties to calculate",
      totalPenalties: 0,
      totalAmount: 0,
      penalties: [],
    };
  }

  // Calculate penalty details
  const penaltyDetails = attendances.map((attendance) => ({
    attendanceId: attendance.id,
    parentId: attendance.parentId,
    parentName: attendance.parent.name,
    meetingId: attendance.meetingId,
    meetingTitle: attendance.meeting.title,
    meetingDate: attendance.meeting.date,
    status: attendance.status,
    isLate: attendance.isLate,
    lateMinutes: attendance.lateMinutes,
    penaltyAmount: attendance.penaltyAmount,
    reason:
      attendance.status === "ABSENT"
        ? "Absence from meeting"
        : "Late arrival to meeting",
  }));

  const totalAmount = penaltyDetails.reduce(
    (sum, p) => sum + (p.penaltyAmount || 0),
    0
  );

  // Apply penalties if requested
  if (applyPenalties) {
    await prisma.$transaction(async (tx) => {
      // Create penalty records
      for (const detail of penaltyDetails) {
        await tx.penalty.create({
          data: {
            parentId: detail.parentId,
            meetingId: detail.meetingId,
            amount: detail.penaltyAmount || 0,
            balance: detail.penaltyAmount || 0, // Balance equals amount initially
            reason: detail.reason,
            isPaid: false,
          },
        });

        // Mark attendance as penalty applied
        await tx.attendance.update({
          where: { id: detail.attendanceId },
          data: {
            penaltyApplied: true,
            penaltyAppliedAt: new Date(),
          },
        });
      }
    });

    return {
      message: `${penaltyDetails.length} penalties applied successfully`,
      totalPenalties: penaltyDetails.length,
      totalAmount,
      penalties: penaltyDetails,
    };
  }

  return {
    message: `${penaltyDetails.length} penalties calculated (not applied)`,
    totalPenalties: penaltyDetails.length,
    totalAmount,
    penalties: penaltyDetails,
  };
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (filters?: {
  meetingId?: number;
  parentId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  // Build where clause
  const where: Prisma.AttendanceWhereInput = {};

  if (filters?.meetingId) {
    where.meetingId = filters.meetingId;
  }

  if (filters?.parentId) {
    where.parentId = filters.parentId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const dateFilter: any = {};

    if (filters.dateFrom) {
      dateFilter.gte = filters.dateFrom;
    }

    if (filters.dateTo) {
      dateFilter.lte = filters.dateTo;
    }

    where.meeting = {
      date: dateFilter,
    };
  }

  // Get all attendance records
  const attendances = await prisma.attendance.findMany({
    where,
  });

  // Calculate statistics
  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
  const excusedCount = attendances.filter((a) => a.status === "EXCUSED").length;
  const lateCount = attendances.filter((a) => a.isLate).length;
  const penaltyCount = attendances.filter((a) => a.hasPenalty).length;
  const totalPenaltyAmount = attendances
    .filter((a) => a.penaltyAmount)
    .reduce((sum, a) => sum + (a.penaltyAmount || 0), 0);

  // Get status breakdown by percentage
  const statusBreakdown = {
    PRESENT: {
      count: presentCount,
      percentage:
        totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
    },
    ABSENT: {
      count: absentCount,
      percentage:
        totalRecords > 0 ? ((absentCount / totalRecords) * 100).toFixed(2) : 0,
    },
    EXCUSED: {
      count: excusedCount,
      percentage:
        totalRecords > 0 ? ((excusedCount / totalRecords) * 100).toFixed(2) : 0,
    },
  };

  // Get attendance rate
  const attendanceRate =
    totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;

  // Get late rate
  const lateRate =
    presentCount > 0 ? ((lateCount / presentCount) * 100).toFixed(2) : 0;

  // Get average late minutes
  const lateAttendances = attendances.filter((a) => a.isLate);
  const averageLateMinutes =
    lateAttendances.length > 0
      ? (
          lateAttendances.reduce((sum, a) => sum + a.lateMinutes, 0) /
          lateAttendances.length
        ).toFixed(2)
      : 0;

  return {
    totalRecords,
    attendanceRate,
    statusBreakdown,
    lateStatistics: {
      totalLate: lateCount,
      lateRate,
      averageLateMinutes,
    },
    penaltyStatistics: {
      totalWithPenalty: penaltyCount,
      totalPenaltyAmount,
      averagePenaltyAmount:
        penaltyCount > 0 ? (totalPenaltyAmount / penaltyCount).toFixed(2) : 0,
    },
  };
};

/**
 * Get current user's attendance records
 */
export const getMyAttendance = async (userId: number, params: any = {}) => {
  const { page = 1, limit = 10, status, meetingId } = params;
  const offset = (page - 1) * limit;

  const where: any = {
    parentId: userId,
  };

  if (status) {
    where.status = status;
  }

  if (meetingId) {
    where.meetingId = parseInt(meetingId);
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
          venue: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: parseInt(limit),
  });

  const total = await prisma.attendance.count({ where });

  return {
    attendances,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get current user's penalties
 */
export const getMyPenalties = async (userId: number) => {
  const penalties = await prisma.attendance.findMany({
    where: {
      parentId: userId,
      hasPenalty: true,
    },
    include: {
      meeting: {
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPenaltyAmount = penalties.reduce(
    (sum, penalty) => sum + (penalty.penaltyAmount || 0),
    0
  );

  return {
    penalties,
    summary: {
      totalPenalties: penalties.length,
      totalAmount: totalPenaltyAmount,
    },
  };
};

/**
 * Get attendance records for a specific meeting
 */
export const getAttendanceByMeeting = async (meetingId: number) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      meetingId,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      parent: { name: "asc" },
    },
  });

  const summary = {
    totalRecords: attendances.length,
    present: attendances.filter((a) => a.status === "PRESENT").length,
    absent: attendances.filter((a) => a.status === "ABSENT").length,
    excused: attendances.filter((a) => a.status === "EXCUSED").length,
    late: attendances.filter((a) => a.isLate).length,
    withPenalty: attendances.filter((a) => a.hasPenalty).length,
  };

  return {
    meeting: {
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      startTime: meeting.startTime,
      venue: meeting.venue,
    },
    attendances,
    summary,
  };
};
