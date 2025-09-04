import prisma from "../../configs/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import otpGenerator from "otp-generator";
import ApiError from "../../utils/ApiError";
import sendEmail from "../../utils/email";
import { Prisma, User } from "@prisma/client";

interface JwtPayload {
  id: number;
  iat?: number;
  exp?: number;
}

interface OtpOptions {
  upperCase?: boolean;
  specialChars?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  digits?: boolean;
}

const generateToken = (userId: number): string => {
  const payload: JwtPayload = { id: userId };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    algorithm: "HS256",
  } as jwt.SignOptions);
};

export const sendOtp = async (email: string): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    throw new ApiError(400, "User with this email already exists");
  }

  const otpOptions = {
    upperCase: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  };
  const otp = otpGenerator.generate(6, otpOptions);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otp.create({
      data: {
        email,
        otp,
        createdAt: expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to create OTP record");
    }
    throw error;
  }

  try {
    await sendEmail({
      email,
      subject: "Your OTP for ePTA Registration",
      message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later."
    );
  }

  return { message: "OTP sent to your email." };
};

export const verifyOtp = async (
  email: string,
  otp: string
): Promise<{ message: string }> => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Delete the OTP after successful verification
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  return { message: "Email verified successfully." };
};

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const register = async (
  userData: RegisterData
): Promise<{ user: User; token: string }> => {
  const { email, password, name, phone } = userData;

  const hashedPassword = await bcrypt.hash(password, 12);

  let user: User;
  try {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(400, "Email already exists");
      }
    }
    throw error;
  }

  const token = generateToken(user.id);

  return { user, token };
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  const token = generateToken(user.id);

  return { user, token };
};

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return { message: "Password reset successfully." };
};

export const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    throw new ApiError(401, "Incorrect email or old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully." };
};
