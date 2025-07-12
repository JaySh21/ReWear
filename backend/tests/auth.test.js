import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";

describe("Authentication Endpoints", () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/rewear_test"
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      await request(app).post("/api/auth/register").send(userData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("already exists");
    });

    it("should return error for invalid data", async () => {
      const invalidData = {
        name: "T",
        email: "invalid-email",
        password: "123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return error for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      token = loginResponse.body.data.token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe("Test User");
      expect(response.body.data.email).toBe("test@example.com");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("No token provided");
    });

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid token");
    });
  });
});
