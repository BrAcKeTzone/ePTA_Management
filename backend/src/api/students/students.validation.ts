import Joi from "joi";
import { StudentStatus, LinkStatus } from "@prisma/client";

// Common patterns for college
const studentIdPattern = /^[0-9]{4}-[0-9]{5}$/; // Format: 2024-12345
const academicYearPattern = /^[0-9]{4}-[0-9]{4}$/; // Format: 2023-2024
const yearLevelOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
];
const programOptions = [
  "BSIT",
  "BSCS",
  "BSED",
  "BEED",
  "BSBA",
  "BSN",
  "BSME",
  "BSCE",
  "BSEE",
  "BSAG",
  "BSFOR",
  "BSPSYCH",
  "BSMATH",
  "BSPHY",
  "BSCHEM",
  "BSBIO",
];

export const createStudent = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required().messages({
    "string.pattern.base":
      "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
  }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  middleName: Joi.string().min(2).max(50).optional().allow(""),
  academicYear: Joi.string().pattern(academicYearPattern).required().messages({
    "string.pattern.base":
      "Academic year must follow format: YYYY-YYYY (e.g., 2023-2024)",
  }),
  yearLevel: Joi.string()
    .valid(...yearLevelOptions)
    .required(),
  program: Joi.string()
    .valid(...programOptions)
    .required(),
  section: Joi.string().max(10).optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  phone: Joi.string().min(10).max(15).optional().allow(""),
  parentId: Joi.number().integer().positive().required(),
});

export const updateStudent = Joi.object().keys({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  middleName: Joi.string().min(2).max(50).optional().allow(""),
  academicYear: Joi.string().pattern(academicYearPattern).optional().messages({
    "string.pattern.base":
      "Academic year must follow format: YYYY-YYYY (e.g., 2023-2024)",
  }),
  yearLevel: Joi.string()
    .valid(...yearLevelOptions)
    .optional(),
  program: Joi.string()
    .valid(...programOptions)
    .optional(),
  section: Joi.string().max(10).optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  phone: Joi.string().min(10).max(15).optional().allow(""),
  status: Joi.string()
    .valid(...Object.values(StudentStatus))
    .optional(),
  linkStatus: Joi.string()
    .valid(...Object.values(LinkStatus))
    .optional(),
});

export const getStudents = Joi.object().keys({
  search: Joi.string().max(100).optional(),
  academicYear: Joi.string().pattern(academicYearPattern).optional(),
  yearLevel: Joi.string()
    .valid(...yearLevelOptions)
    .optional(),
  program: Joi.string()
    .valid(...programOptions)
    .optional(),
  status: Joi.string()
    .valid(...Object.values(StudentStatus))
    .optional(),
  linkStatus: Joi.string()
    .valid(...Object.values(LinkStatus))
    .optional(),
  parentId: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const studentIdParam = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
});

export const studentIdStringParam = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required(),
});

export const parentIdParam = Joi.object().keys({
  parentId: Joi.number().integer().positive().required(),
});

export const bulkUpdateStatus = Joi.object().keys({
  studentIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
  status: Joi.string()
    .valid(...Object.values(StudentStatus))
    .required(),
});

export const getPaginated = Joi.object().keys({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const requestLinkStudent = Joi.object().keys({
  studentId: Joi.string().pattern(studentIdPattern).required().messages({
    "string.pattern.base":
      "Student ID must follow format: YYYY-NNNNN (e.g., 2024-12345)",
  }),
  parentId: Joi.number().integer().positive().required(),
});

export const unlinkStudent = Joi.object().keys({
  userId: Joi.number().integer().positive().required(),
  userRole: Joi.string().valid("ADMIN", "PARENT").required(),
});
