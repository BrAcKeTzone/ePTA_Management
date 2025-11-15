import prisma from "../../configs/prisma";
import ApiError from "../../utils/ApiError";

const validPositions = ["president", "vicePresident", "secretary", "treasurer", "pio"];

// Get all officers with user details
export const getAllOfficers = async () => {
  const officers = await prisma.officer.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Transform to the format expected by frontend
  const officersMap: Record<string, any> = {
    president: null,
    vicePresident: null,
    secretary: null,
    treasurer: null,
    pio: null,
  };

  officers.forEach((officer) => {
    if (validPositions.includes(officer.position)) {
      officersMap[officer.position] = officer.user;
    }
  });

  return officersMap;
};

// Assign an officer to a position
export const assignOfficer = async (position: string, userId: number) => {
  // Validate position
  if (!validPositions.includes(position)) {
    throw new ApiError(400, "Invalid position");
  }

  // Check if user exists and is a PARENT
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "PARENT") {
    throw new ApiError(400, "Only parents can be assigned as officers");
  }

  // Check if user is already assigned to another position
  const existingOfficer = await prisma.officer.findUnique({
    where: { userId },
  });

  if (existingOfficer && existingOfficer.position !== position) {
    throw new ApiError(400, "User is already assigned to another officer position");
  }

  // Upsert the officer (create or update)
  const officer = await prisma.officer.upsert({
    where: { position },
    update: { userId },
    create: { position, userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return officer;
};

// Remove an officer from a position
export const removeOfficer = async (position: string) => {
  // Validate position
  if (!validPositions.includes(position)) {
    throw new ApiError(400, "Invalid position");
  }

  // Check if officer exists
  const officer = await prisma.officer.findUnique({
    where: { position },
  });

  if (!officer) {
    throw new ApiError(404, "No officer assigned to this position");
  }

  // Delete the officer
  await prisma.officer.delete({
    where: { position },
  });

  return true;
};
