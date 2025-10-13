import request from "supertest";
import app from "../index"; // Ensure this points to where your Express app is exported

describe("GET /api/areas/", () => {
  it("returns the areas created", async () => {
    const res = await request(app).get("/api/areas");
    expect(res.statusCode).toBe(200);
    expect(res.body); // Assuming your API returns a token
  });
});
