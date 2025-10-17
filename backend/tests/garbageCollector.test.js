import request from "supertest";
import mongoose from "mongoose";
import app from "../index.js";
import Collector from "../models/collectorModel.js";
import Garbage from "../models/garbageModel.js";
import Area from "../models/areaModel.js";
import WMA from "../models/wmaModel.js";
import User from "../models/userModel.js";
import { connectTestDB, disconnectTestDB, clearTestDB } from '../config/test.db.js';

describe("Garbage Collector Flow Tests", () => {
  let collector;
  let collectorToken;
  let testArea;
  let testBin;
  let testUser;
  let wma;

  // Setup test database and test data
  beforeAll(async () => {
    await connectTestDB();
    
    // Create test user
    const testUser = await User.create({
      name: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      password: "test123456",
      address: "123 Test Street",
      contact: "1234567890"
    });

    // Create test WMA
    wma = await WMA.create({
      wmaname: "Test WMA",
      district: "Test District",
      email: "test.wma@example.com",
      password: "test123456",
      authNumber: "WMA123456",
      contact: "1234567890",
      address: "Test WMA Address"
    });

    // Create test area
    testArea = await Area.create({
      name: "Test Area",
      district: "Test District",
      type: "weightBased",
      rate: 50
    });

    // Create test collector
    collector = await Collector.create({
      wmaId: wma._id,
      collectorName: "Test Collector",
      collectorNIC: "TEST123456",
      truckNumber: "TEST-123",
      contactNo: "1234567890",
      statusOfCollector: "Available",
      assignedAreas: [testArea._id]
    });

    // Create test bin
    testBin = await Garbage.create({
      user: testUser._id,
      binId: "TEST-BIN-123",
      area: testArea._id,
      type: "Recyclable",
      address: "Test Address",
      latitude: 6.9271,
      longitude: 79.8612,
      isBinRegistered: true,
      sensorData: {
        fillLevel: "Full",
        fillPercentage: 100
      },
      isVisibleToCollectors: true
    });

    // Get collector token
    const authResponse = await request(app)
      .post("/api/collector/auth")
      .send({
        collectorNIC: "TEST123456",
        truckNumber: "TEST-123"
      });
    collectorToken = authResponse.body.token;
  });

  // Clear database between tests
  beforeEach(async () => {
    await clearTestDB();

    // Recreate test user
    testUser = await User.create({
      name: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      password: "test123456",
      address: "123 Test Street",
      contact: "1234567890"
    });

    // Recreate test collector
    collector = await Collector.create({
      wmaId: wma._id,
      collectorName: "Test Collector",
      collectorNIC: "TEST123456",
      truckNumber: "TEST-123",
      contactNo: "1234567890",
      statusOfCollector: "Available",
      assignedAreas: [testArea._id]
    });

    // Recreate test bin
    testBin = await Garbage.create({
      user: testUser._id,
      binId: "TEST-BIN-123",
      area: testArea._id,
      type: "Recyclable",
      address: "Test Address",
      latitude: 6.9271,
      longitude: 79.8612,
      isBinRegistered: true,
      sensorData: {
        fillLevel: "Full",
        fillPercentage: 100
      },
      isVisibleToCollectors: true
    });

    // Get fresh collector token
    const authResponse = await request(app)
      .post("/api/collector/auth")
      .send({
        collectorNIC: "TEST123456",
        truckNumber: "TEST-123"
      });
    
    collectorToken = authResponse.body.token;
  });

  // Cleanup after tests
  afterAll(async () => {
    await disconnectTestDB();
  });

  // Positive test cases
  describe("Positive Cases", () => {
    it("should get full bins for collector's assigned areas", async () => {
      const res = await request(app)
        .get("/api/garbage/collector/full-bins")
        .set("Authorization", `Bearer ${collectorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.bins)).toBe(true);
      expect(res.body.bins.length).toBeGreaterThan(0);
      expect(res.body.bins[0].sensorData.fillLevel).toMatch(/^(Full|High)$/);
    });

    it("should mark bin as collected with weight", async () => {
      const res = await request(app)
        .put(`/api/garbage/${testBin._id}/collect`)
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({ weight: 25 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.bin.status).toBe("Collected");
      expect(res.body.bin.sensorData.fillLevel).toBe("Empty");
      expect(res.body.bin.sensorData.fillPercentage).toBe(0);
      expect(res.body.bin.weight).toBe(25);
    });
  });

  // Negative test cases
  describe("Negative Cases", () => {
    it("should reject collection without authentication", async () => {
      const res = await request(app)
        .put(`/api/garbage/${testBin._id}/collect`)
        .send({ weight: 25 });

      expect(res.statusCode).toBe(401);
    });

    it("should reject collection for non-assigned area", async () => {
      // Create test user for other bin
      const otherUser = await User.create({
        name: "Other User",
        username: "otheruser",
        email: "otheruser@example.com",
        password: "test123456",
        address: "456 Other Street",
        contact: "9876543210"
      });

      // Create bin in different area
      const otherArea = await Area.create({
        name: "Other Area",
        district: "Other District"
      });

      const otherBin = await Garbage.create({
        user: otherUser._id,
        binId: "OTHER-BIN-123",
        area: otherArea._id,
        type: "Recyclable",
        address: "Other Address",
        latitude: 6.9271,
        longitude: 79.8612,
        isBinRegistered: true,
        sensorData: {
          fillLevel: "Full",
          fillPercentage: 100
        },
        isVisibleToCollectors: true
      });

      const res = await request(app)
        .put(`/api/garbage/${otherBin._id}/collect`)
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({ weight: 25 });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/not assigned to this area/i);
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("should handle invalid bin ID", async () => {
      const res = await request(app)
        .put("/api/garbage/invalid-id/collect")
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({ weight: 25 });

      expect(res.statusCode).toBe(400);
    });

    it("should handle negative weight values", async () => {
      const res = await request(app)
        .put(`/api/garbage/${testBin._id}/collect`)
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({ weight: -5 });

      expect(res.statusCode).toBe(400);
    });

    it("should accept collection without weight", async () => {
      const res = await request(app)
        .put(`/api/garbage/${testBin._id}/collect`)
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.bin.weight).toBe(0);
    });
  });

  // Error cases
  describe("Error Cases", () => {
    it("should handle garbage collection errors gracefully", async () => {
      // Test that the API returns appropriate error responses
      // Try to collect a bin that doesn't exist
      const fakeId = "000000000000000000000000";
      const res = await request(app)
        .put(`/api/garbage/${fakeId}/collect`)
        .set("Authorization", `Bearer ${collectorToken}`)
        .send({ weight: 25 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("should handle concurrent collection attempts on same bin", async () => {
      // Both requests try to collect the same bin
      // Only one should succeed, others should fail or get the already-collected state
      const attempts = await Promise.allSettled([
        request(app)
          .put(`/api/garbage/${testBin._id}/collect`)
          .set("Authorization", `Bearer ${collectorToken}`)
          .send({ weight: 25 }),
        request(app)
          .put(`/api/garbage/${testBin._id}/collect`)
          .set("Authorization", `Bearer ${collectorToken}`)
          .send({ weight: 30 })
      ]);

      // At least one request should have succeeded
      const fulfilled = attempts.filter(r => r.status === 'fulfilled');
      expect(fulfilled.length).toBeGreaterThan(0);
      
      // At least one should have gotten a successful 200 response
      const successfulResponses = fulfilled
        .map(r => r.value)
        .filter(r => r.statusCode === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});