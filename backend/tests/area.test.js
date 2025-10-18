import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../index";
import Area from "../models/areaModel.js";
import User from "../models/userModel.js";

describe("Area API Tests", () => {
  let adminUser;
  let normalUser;
  let adminCookie;
  let userCookie;

  // Setup before all tests
  beforeAll(async () => {
    // Clean up any existing test users
    await User.deleteMany({ email: { $in: ["admin@test.com", "user@test.com"] } });

    // Create admin user
    adminUser = await User.create({
      username: "admintest",
      email: "admin@test.com",
      password: "Admin123!",
      isAdmin: true,
    });

    // Create normal user
    normalUser = await User.create({
      username: "usertest",
      email: "user@test.com",
      password: "User123!",
      isAdmin: false,
    });

    // Generate JWT cookies
    const adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    const userToken = jwt.sign({ userId: normalUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    
    adminCookie = `jwt=${adminToken}`;
    userCookie = `jwt=${userToken}`;
  });

  // Clean up after each test
  afterEach(async () => {
    // Only delete areas created in tests, not test users
    await Area.deleteMany({});
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({ email: { $in: ["admin@test.com", "user@test.com"] } });
    // Close mongoose connection
    await mongoose.connection.close();
  });

  describe("POST /api/areas", () => {
    it("should create a new area with admin authentication", async () => {
      const areaData = {
        name: "Test Area",
        district: "Test District",
        postalCode: "12345",
        coordinates: {
          latitude: 6.9271,
          longitude: 79.8612,
        },
        isActive: true,
      };

      const res = await request(app)
        .post("/api/areas")
        .set("Cookie", [adminCookie])
        .send(areaData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe(areaData.name);
      expect(res.body.district).toBe(areaData.district);
      expect(res.body.postalCode).toBe(areaData.postalCode);
      expect(res.body.isActive).toBe(true);
    });

    it("should fail to create area without authentication", async () => {
      const areaData = {
        name: "Test Area",
        district: "Test District",
      };

      const res = await request(app)
        .post("/api/areas")
        .send(areaData);

      expect(res.statusCode).toBe(401);
    });

    it("should fail to create area without admin privileges", async () => {
      const areaData = {
        name: "Test Area",
        district: "Test District",
      };

      const res = await request(app)
        .post("/api/areas")
        .set("Cookie", [userCookie])
        .send(areaData);

      expect(res.statusCode).toBe(401);
    });

    it("should fail to create area with missing required fields", async () => {
      const areaData = {
        name: "Test Area",
        // Missing district
      };

      const res = await request(app)
        .post("/api/areas")
        .set("Cookie", [adminCookie])
        .send(areaData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please fill all required fields");
    });

    it("should fail to create duplicate area in same district", async () => {
      const areaData = {
        name: "Duplicate Area",
        district: "Duplicate District",
      };

      // Create first area
      await request(app)
        .post("/api/areas")
        .set("Cookie", [adminCookie])
        .send(areaData);

      // Try to create duplicate
      const res = await request(app)
        .post("/api/areas")
        .set("Cookie", [adminCookie])
        .send(areaData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Area already exists in this district");
    });

    it("should create area with minimal required fields", async () => {
      const areaData = {
        name: "Minimal Area",
        district: "Minimal District",
      };

      const res = await request(app)
        .post("/api/areas")
        .set("Cookie", [adminCookie])
        .send(areaData);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(areaData.name);
      expect(res.body.district).toBe(areaData.district);
      expect(res.body.isActive).toBe(true); // Default value
    });
  });

  describe("GET /api/areas", () => {
    beforeEach(async () => {
      // Create test areas
      await Area.create([
        { name: "Area 1", district: "District 1" },
        { name: "Area 2", district: "District 2" },
        { name: "Area 3", district: "District 3" },
      ]);
    });

    it("should return all areas", async () => {
      const res = await request(app).get("/api/areas");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it("should return empty array when no areas exist", async () => {
      await Area.deleteMany({});
      
      const res = await request(app).get("/api/areas");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("GET /api/areas/:id", () => {
    let testArea;

    beforeEach(async () => {
      testArea = await Area.create({
        name: "Single Area",
        district: "Single District",
        postalCode: "54321",
      });
    });

    it("should return a single area by ID", async () => {
      const res = await request(app).get(`/api/areas/${testArea._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(testArea._id.toString());
      expect(res.body.name).toBe(testArea.name);
      expect(res.body.district).toBe(testArea.district);
    });

    it("should return 404 for non-existent area ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/areas/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Area not found");
    });

    it("should return 500 for invalid area ID format", async () => {
      const res = await request(app).get("/api/areas/invalid-id");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/areas/:id", () => {
    let testArea;

    beforeEach(async () => {
      testArea = await Area.create({
        name: "Update Area",
        district: "Update District",
        postalCode: "11111",
      });
    });

    it("should update an area with admin authentication", async () => {
      const updateData = {
        name: "Updated Area",
        district: "Updated District",
        postalCode: "99999",
        isActive: false,
      };

      const res = await request(app)
        .put(`/api/areas/${testArea._id}`)
        .set("Cookie", [adminCookie])
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.district).toBe(updateData.district);
      expect(res.body.postalCode).toBe(updateData.postalCode);
      expect(res.body.isActive).toBe(false);
    });

    it("should update only specified fields", async () => {
      const updateData = {
        name: "Only Name Updated",
      };

      const res = await request(app)
        .put(`/api/areas/${testArea._id}`)
        .set("Cookie", [adminCookie])
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.district).toBe(testArea.district); // Unchanged
    });

    it("should fail to update without authentication", async () => {
      const res = await request(app)
        .put(`/api/areas/${testArea._id}`)
        .send({ name: "Fail" });

      expect(res.statusCode).toBe(401);
    });

    it("should fail to update without admin privileges", async () => {
      const res = await request(app)
        .put(`/api/areas/${testArea._id}`)
        .set("Cookie", [userCookie])
        .send({ name: "Fail" });

      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent area", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/areas/${fakeId}`)
        .set("Cookie", [adminCookie])
        .send({ name: "Fail" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Area not found");
    });
  });

  describe("DELETE /api/areas/:id", () => {
    let testArea;

    beforeEach(async () => {
      testArea = await Area.create({
        name: "Delete Area",
        district: "Delete District",
      });
    });

    it("should delete an area with admin authentication", async () => {
      const res = await request(app)
        .delete(`/api/areas/${testArea._id}`)
        .set("Cookie", [adminCookie]);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Area removed successfully");

      // Verify area is deleted
      const deletedArea = await Area.findById(testArea._id);
      expect(deletedArea).toBeNull();
    });

    it("should fail to delete without authentication", async () => {
      const res = await request(app)
        .delete(`/api/areas/${testArea._id}`);

      expect(res.statusCode).toBe(401);
    });

    it("should fail to delete without admin privileges", async () => {
      const res = await request(app)
        .delete(`/api/areas/${testArea._id}`)
        .set("Cookie", [userCookie]);

      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent area", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/areas/${fakeId}`)
        .set("Cookie", [adminCookie]);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("Area not found");
    });
  });
});
