import request from "supertest";
import app from "../index"; // Ensure this points to where your Express app is exported
import SmartDevice from "../models/smartDeviceModel";

// Test suite for GET /api/smartDevices/
describe("GET /api/smartDevices/", () => {
  // Test case: Should return all smart devices (Admin only)
  it("returns all smart devices", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWEzNmMxYjNmODViMmZmMTlmMjUiLCJpYXQiOjE3MjkzNTQwNDQsImV4cCI6MTczMTk0NjA0NH0.IQZJsB06DG3AbmfApGUe1lgo0NhJdyS52elYOtoqeeg"; // Replace with a valid admin JWT token

    const res = await request(app)
      .get("/api/smartDevices/")
      .set("Authorization", `Bearer ${token}`);

    // Check for successful response status
    expect(res.statusCode).toBe(200);

    // Expect a response body (assuming it's a list of smart devices)
    expect(res.body).toBeInstanceOf(Array);
  });

  // Test case: Should return 404 for an invalid endpoint
  it("returns 404 for an invalid endpoint", async () => {
    const res = await request(app).get("/api/invalid-endpoint/");

    // Expect 404 Not Found for invalid route
    expect(res.statusCode).toBe(404);
  });
});

// Test suite for POST /api/smartDevices/
describe("POST /api/smartDevices/", () => {
  // Test case: Should create a smart device successfully
  it("creates a smart device successfully", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWZiZDRkYTQ1Mjk0YzA0ZWE0MWUiLCJpYXQiOjE3MjkzNTQ2NjEsImV4cCI6MTczMTk0NjY2MX0.MYDS3z5Jji48dsm1pw3uc1lK_SeMyyhO7PMZTf_a3XI"; // Replace with a valid user JWT token

    const newDevice = {
      area: "6704064d5ad2461800050f1f", // Replace with a valid area ID
      longitude: 77.7777,
      latitude: 5.5454,
      type: "recyclable",
    };

    const res = await request(app)
      .post("/api/smartDevices/")
      .set("Authorization", `Bearer ${token}`)
      .send(newDevice);

    // Check for successful response status
    expect(res.statusCode).toBe(201);

    // Check that the response contains the created smart device
    expect(res.body).toHaveProperty("_id");
    expect(res.body.area).toBe(newDevice.area);
    expect(res.body.longitude).toBe(newDevice.longitude);
    expect(res.body.latitude).toBe(newDevice.latitude);
    expect(res.body.type).toBe(newDevice.type);
  });

  // Test case: Should return 500 if required fields are missing
  it("returns 500 if required fields are missing", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWEzNmMxYjNmODViMmZmMTlmMjUiLCJpYXQiOjE3MjkzNTQwNDQsImV4cCI6MTczMTk0NjA0NH0.IQZJsB06DG3AbmfApGUe1lgo0NhJdyS52elYOtoqeeg"; // Replace with a valid user JWT token

    const incompleteDevice = {
      longitude: 79.3211,
      latitude: 6.3216,
      type: "Recyclable",
    };

    const res = await request(app)
      .post("/api/smartDevices/")
      .set("Authorization", `Bearer ${token}`)
      .send(incompleteDevice);

    // Check for 500 Bad Request status
    expect(res.statusCode).toBe(500);

    // Check for error message in response body
    expect(res.body.message).toBe("Please fill all required fields.");
  });

  // Test case: Should return 404 if the user is not found
  it("returns 500 if the user is not found", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWEzNmMxYjNmODViMmZmMTlmMjUiLCJpYXQiOjE3MjkzNTQwNDQsImV4cCI6MTczMTk0NjA0NH0.IQZJsB06DG3AbmfApGUe1lgo0NhJdyS52elYOtoqeegg"; // Replace with an invalid user JWT token

    const newDevice = {
      area: "6704064d5ad2461800050f1f", // Replace with a valid area ID
      longitude: 79.3211,
      latitude: 6.3216,
      type: "Recyclable",
    };

    const res = await request(app)
      .post("/api/smartDevices/")
      .set("Authorization", `Bearer ${token}`)
      .send(newDevice);

    // Check for 500 Not Found status
    expect(res.statusCode).toBe(500);

    // Check for error message in response body
    expect(res.body.message).toBe("Not authorized, token failed");
  });

  // Test case: Should return 404 if the area is not found
  it("returns 500 if the area is not found", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWEzNmMxYjNmODViMmZmMTlmMjUiLCJpYXQiOjE3MjkzNTQwNDQsImV4cCI6MTczMTk0NjA0NH0.IQZJsB06DG3AbmfApGUe1lgo0NhJdyS52elYOtoqeeg"; // Replace with a valid user JWT token

    const newDevice = {
      area: "616a6a6d7b59a8255dfe0000", // Invalid area ID
      longitude: 79.3211,
      latitude: 6.3216,
      type: "Recyclable",
    };

    const res = await request(app)
      .post("/api/smartDevices/")
      .set("Authorization", `Bearer ${token}`)
      .send(newDevice);

    // Check for 404 Not Found status
    expect(res.statusCode).toBe(500);

    // Check for error message in response body
    expect(res.body.message).toBe("Area not found.");
  });
});

// Test suite for DELETE /api/smartDevices/:id
describe("DELETE /api/smartDevices/:id", () => {
  // Test case: Should delete a smart device (Admin only)
  it("deletes a smart device successfully when requested by an admin", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWEzNmMxYjNmODViMmZmMTlmMjUiLCJpYXQiOjE3MjkzNTQwNDQsImV4cCI6MTczMTk0NjA0NH0.IQZJsB06DG3AbmfApGUe1lgo0NhJdyS52elYOtoqeeg"; // Replace with a valid admin JWT token

    // Assuming you create a device for testing purpose
    const newDevice = await SmartDevice.create({
      userId: "6713aac5c1b3f85b2ff19f2c", // Ensure this is a valid user ID
      area: "6704064d5ad2461800050f1f", // Ensure this is a valid area ID
      longitude: 79.3211,
      latitude: 6.3216,
      type: "recyclable",
    });

    const res = await request(app)
      .delete(`/api/smartDevices/${newDevice._id}`)
      .set("Authorization", `Bearer ${token}`);

    // Check for successful response status
    expect(res.statusCode).toBe(200);

    // Check for the expected response message
    expect(res.body).toEqual({ message: "Smart device removed successfully!" });

    // Verify the device is actually deleted
    const deletedDevice = await SmartDevice.findById(newDevice._id);
    expect(deletedDevice).toBeNull();
  });
});
