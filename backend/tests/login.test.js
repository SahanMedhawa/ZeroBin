import request from "supertest";
import app from "../index"; // Ensure this points to where your Express app is exported

describe("POST /api/users/auth", () => {
  // Test case for logging in a user with correct credentials
  it("should log in a user with correct credentials", async () => {
    const res = await request(app).post("/api/users/auth").send({
      email: "arsh@gmail.com",
      password: "arsh123",
    });
    expect(res.statusCode).toBe(201); // Expecting a 201 status code for successful login
    expect(res.body).toHaveProperty("token"); // Assuming your API returns a token
  });

  // Test case for handling incorrect login credentials
  it("should return error with incorrect credentials", async () => {
    const res = await request(app).post("/api/users/auth").send({
      email: "wrong@example.com",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(500); // Assuming 500 for Unauthorized
    expect(res.body).toHaveProperty("message"); // Expecting an error message in the response body
  });
});
