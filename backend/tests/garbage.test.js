import request from "supertest";
import app from "../index"; // Ensure this points to where your Express app is exported

// Test suite for GET /api/garbage/
describe("GET /api/garbage/", () => {
  // Test case: Should return all garbage requests
  it("returns the garbages created", async () => {
    const res = await request(app).get("/api/garbage/");

    // Check for successful response status
    expect(res.statusCode).toBe(200);

    // Expect a response body (assuming it's a list of garbages)
    expect(res.body); // Add more specific checks based on your API's response structure
  });

  // Test case: Should return 404 for an invalid endpoint
  it("returns 404 for an invalid endpoint", async () => {
    const res = await request(app).get("/api/invalid-endpoint/");

    // Expect 404 Not Found for invalid route
    expect(res.statusCode).toBe(404);
  });
});

// Test suite for POST /api/garbage/
describe("POST /api/garbage/", () => {
  // Test case: Should create a new garbage request with valid data
  it("should create a garbage request", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWZiZDRkYTQ1Mjk0YzA0ZWE0MWUiLCJpYXQiOjE3MjkzNDY0NTksImV4cCI6MTczMTkzODQ1OX0.jUziEFuxJWf3NKfe_txzkwLCEkZ5vVnYUdXjYk_k77Q"; // Replace with a valid JWT token

    const res = await request(app)
      .post("/api/garbage/")
      .set("Authorization", `Bearer ${token}`) // Set Authorization header
      .send({
        longitude: 77.777,
        latitude: 23.2323,
        type: "Recyclable",
        address: "Testing address",
        area: "6703ffa8c936b7432d667c8e", // Replace with a valid area ID
      });

    // Check for successful creation status
    expect(res.statusCode).toBe(201);

    // Expect the response to contain a newly created garbage request ID
    expect(res.body).toHaveProperty("_id");
  });

  // Test case: Should fail to create a garbage request without a token
  it("should fail to create a garbage request without a token", async () => {
    const res = await request(app).post("/api/garbage/").send({
      longitude: 79.3211,
      latitude: 6.3216,
      type: "Recyclable",
      address: "Px New York",
      area: "6703ffa8c936b7432d667c8e", // Replace with a valid area ID
    });

    // Expect a failure due to missing authorization token
    expect(res.statusCode).toBe(500); // Adjust the status code based on your error handling (401 Unauthorized would be ideal)
  });

  // Test case: Should fail to create a garbage request with invalid data
  it("should fail to create a garbage request with invalid data", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWZiZDRkYTQ1Mjk0YzA0ZWE0MWUiLCJpYXQiOjE3MjkzNDY0NTksImV4cCI6MTczMTkzODQ1OX0.jUziEFuxJWf3NKfe_txzkwLCEkZ5vVnYUdXjYk_k77Q"; // Replace with a valid JWT token

    const res = await request(app)
      .post("/api/garbage/")
      .set("Authorization", `Bearer ${token}`) // Set Authorization header
      .send({
        longitude: "invalid", // Invalid longitude format (should be a number)
        latitude: 6.3216,
        type: "Recyclable",
        address: "Px",
        area: "6703ffa8c936b7432d667c8e", // Replace with a valid area ID
      });

    // Expect a failure due to invalid data
    expect(res.statusCode).toBe(500); // Adjust status code based on your validation handling (400 Bad Request might be ideal)
  });
});

// Test suite for DELETE /api/garbage/:id
describe("DELETE /api/garbage/:id", () => {
  // Test case: Should successfully delete a garbage request
  it("should delete a garbage request", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWZiZDRkYTQ1Mjk0YzA0ZWE0MWUiLCJpYXQiOjE3MjkzNDc5ODgsImV4cCI6MTczMTkzOTk4OH0.9-INxvW4PBCxTrFmwTS3Cq9_8WDV7jrVg_-HDrEdZcM"; // Replace with a valid JWT token
    const garbageId = "6713bc036587b324ea9970a7"; // Replace with a valid garbage ID

    const res = await request(app)
      .delete(`/api/garbage/${garbageId}`)
      .set("Authorization", `Bearer ${token}`); // Set Authorization header

    // Expect successful deletion status
    expect(res.statusCode).toBe(200);

    // Expect a success message confirming the deletion
    expect(res.body).toHaveProperty("message", "Garbage removed successfully!");
  });

  // Test case: Should fail to delete a garbage request without a token
  it("should fail to delete a garbage request without a token", async () => {
    const garbageId = "6713bc036587b324ea9970a7"; // Replace with a valid garbage ID

    const res = await request(app).delete(`/api/garbage/${garbageId}`);

    // Expect a failure due to missing authorization token
    expect(res.statusCode).toBe(500); // Adjust based on your error handling (401 Unauthorized would be ideal)
  });

  // Test case: Should fail to delete a garbage request with an invalid ID
  it("should fail to delete a garbage request with an invalid ID", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEzYWZiZDRkYTQ1Mjk0YzA0ZWE0MWUiLCJpYXQiOjE3MjkzNDc5ODgsImV4cCI6MTczMTkzOTk4OH0.9-INxvW4PBCxTrFmwTS3Cq9_8WDV7jrVg_-HDrEdZcM"; // Replace with a valid JWT token

    const invalidId = "67136163761e1471asdasdqed4cd5ce6"; // Invalid garbage ID

    const res = await request(app)
      .delete(`/api/garbage/${invalidId}`)
      .set("Authorization", `Bearer ${token}`); // Set Authorization header

    // Expect a failure due to invalid ID (garbage request not found)
    expect(res.statusCode).toBe(500); // Adjust based on your error handling (404 Not Found might be ideal)
  });
});
