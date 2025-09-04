import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../app";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Example test user data with unique email for each test
const createTestUser = () => ({
  name: "Test Parent",
  email: `testparent${Date.now()}@example.com`,
  password: "TestPassword123",
  phone: "+1234567890",
});

describe("Auth API", () => {
  beforeAll(async () => {
    try {
      // Push schema to test database
      execSync("npx prisma db push", {
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      });

      // Create a new database connection
      await prisma.$connect();
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  // Clean up before each test using Prisma's built-in methods
  beforeEach(async () => {
    try {
      await prisma.user.deleteMany();
    } catch (error) {
      console.error("Test cleanup failed:", error);
    }
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany();
      await prisma.$disconnect();
    } catch (error) {
      console.error("Test cleanup failed:", error);
    }
  });

  it("should register a new parent", async () => {
    const testUser = createTestUser();
    const res = await request(app).post("/api/auth/register").send(testUser);

    if (res.status !== 201) {
      console.error("Registration failed:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should login with correct credentials", async () => {
    const testUser = createTestUser();
    // First register the user
    await request(app).post("/api/auth/register").send(testUser);

    // Then try to login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
  });

  it("should not login with wrong password", async () => {
    const testUser = createTestUser();
    // First register the user
    await request(app).post("/api/auth/register").send(testUser);

    // Then try to login with wrong password
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Incorrect email or password");
  });
});
