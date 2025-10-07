import request from "supertest";
import app from "../../../app";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { PrismaClient, UserRole } from "@prisma/client";
import { execSync } from "child_process";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Test data
const testParent = {
  name: "Test Parent",
  email: `testparent${Date.now()}@example.com`,
  password: "TestPassword123",
  phone: "+1234567890",
  role: UserRole.PARENT,
};

const testStudent = {
  studentId: "2024-12345",
  firstName: "Juan",
  lastName: "Cruz",
  middleName: "Santos",
  academicYear: "2023-2024",
  yearLevel: "2nd Year",
  program: "BSIT",
  section: "A",
  email: `teststudent${Date.now()}@example.com`,
  phone: "+1234567891",
};

describe("Student Management API", () => {
  let parentId: number;

  beforeAll(async () => {
    try {
      // Push schema to test database
      execSync("npx prisma db push", {
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      });

      await prisma.$connect();
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      // Clean up existing data
      await prisma.student.deleteMany();
      await prisma.user.deleteMany();

      // Create a test parent
      const hashedPassword = await bcrypt.hash(testParent.password, 12);
      const parent = await prisma.user.create({
        data: {
          ...testParent,
          password: hashedPassword,
        },
      });
      parentId = parent.id;
    } catch (error) {
      console.error("Test setup failed:", error);
    }
  });

  afterAll(async () => {
    try {
      await prisma.student.deleteMany();
      await prisma.user.deleteMany();
      await prisma.$disconnect();
    } catch (error) {
      console.error("Test cleanup failed:", error);
    }
  });

  describe("POST /api/students", () => {
    it("should create a new student", async () => {
      const studentData = { ...testStudent, parentId };

      const res = await request(app).post("/api/students").send(studentData);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.studentId).toBe(testStudent.studentId);
      expect(res.body.data.firstName).toBe(testStudent.firstName);
      expect(res.body.data.lastName).toBe(testStudent.lastName);
      expect(res.body.data.status).toBe("ACTIVE");
      expect(res.body.data.linkStatus).toBe("PENDING");
    });

    it("should not create student with duplicate student ID", async () => {
      const studentData = { ...testStudent, parentId };

      // Create first student
      await request(app).post("/api/students").send(studentData);

      // Try to create duplicate
      const res = await request(app).post("/api/students").send(studentData);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Student ID already exists");
    });

    it("should validate student ID format", async () => {
      const invalidStudentData = {
        ...testStudent,
        parentId,
        studentId: "invalid-format",
      };

      const res = await request(app)
        .post("/api/students")
        .send(invalidStudentData);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/students", () => {
    beforeEach(async () => {
      // Create test students
      await prisma.student.create({
        data: { ...testStudent, parentId },
      });
      await prisma.student.create({
        data: {
          ...testStudent,
          studentId: "2024-12346",
          firstName: "Maria",
          lastName: "Garcia",
          email: `teststudent2${Date.now()}@example.com`,
          parentId,
        },
      });
    });

    it("should get all students with pagination", async () => {
      const res = await request(app)
        .get("/api/students")
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("students");
      expect(res.body.data).toHaveProperty("totalCount");
      expect(res.body.data).toHaveProperty("totalPages");
      expect(res.body.data).toHaveProperty("currentPage");
      expect(res.body.data.students.length).toBe(2);
    });

    it("should filter students by program", async () => {
      const res = await request(app)
        .get("/api/students")
        .query({ program: "BSIT" });

      expect(res.status).toBe(200);
      expect(res.body.data.students.length).toBe(2);
      expect(res.body.data.students[0].program).toBe("BSIT");
    });

    it("should search students by name", async () => {
      const res = await request(app)
        .get("/api/students")
        .query({ search: "Juan" });

      expect(res.status).toBe(200);
      expect(res.body.data.students.length).toBe(1);
      expect(res.body.data.students[0].firstName).toBe("Juan");
    });
  });

  describe("GET /api/students/:id", () => {
    let studentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: { ...testStudent, parentId },
      });
      studentId = student.id;
    });

    it("should get student by ID", async () => {
      const res = await request(app).get(`/api/students/${studentId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(studentId);
      expect(res.body.data.firstName).toBe(testStudent.firstName);
    });

    it("should return 404 for non-existent student", async () => {
      const res = await request(app).get("/api/students/99999");

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/students/:id", () => {
    let studentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: { ...testStudent, parentId },
      });
      studentId = student.id;
    });

    it("should update student information", async () => {
      const updateData = {
        firstName: "Juan Carlos",
        yearLevel: "3rd Year",
      };

      const res = await request(app)
        .put(`/api/students/${studentId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("Juan Carlos");
      expect(res.body.data.yearLevel).toBe("3rd Year");
    });
  });

  describe("PATCH /api/students/:id/approve", () => {
    let studentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: { ...testStudent, parentId },
      });
      studentId = student.id;
    });

    it("should approve student link", async () => {
      const res = await request(app).patch(
        `/api/students/${studentId}/approve`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.linkStatus).toBe("APPROVED");
    });
  });

  describe("GET /api/students/stats", () => {
    beforeEach(async () => {
      // Create test students with different statuses
      await prisma.student.createMany({
        data: [
          { ...testStudent, parentId },
          {
            ...testStudent,
            studentId: "2024-12346",
            email: `teststudent2${Date.now()}@example.com`,
            status: "GRADUATED",
            parentId,
          },
        ],
      });
    });

    it("should get enrollment statistics", async () => {
      const res = await request(app).get("/api/students/stats");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("totalStudents");
      expect(res.body.data).toHaveProperty("activeStudents");
      expect(res.body.data).toHaveProperty("graduatedStudents");
      expect(res.body.data).toHaveProperty("byProgram");
      expect(res.body.data).toHaveProperty("byYearLevel");
      expect(res.body.data.totalStudents).toBe(2);
      expect(res.body.data.activeStudents).toBe(1);
      expect(res.body.data.graduatedStudents).toBe(1);
    });
  });
});
