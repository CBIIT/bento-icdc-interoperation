const express = require("express");
const request = require("supertest");

// Mock the config module
jest.mock("../../config", () => ({
  version: "1.2.3",
  date: "2025-01-15",
}));

const interoperationRouter = require("../../routes/interoperation");

describe("interoperationRouter", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use("/api/interoperation", interoperationRouter);
  });

  describe("GET /ping", () => {
    it("should return 'pong'", async () => {
      const response = await request(app).get("/api/interoperation/ping");

      expect(response.status).toBe(200);
      expect(response.text).toBe("pong");
    });
  });

  describe("GET /version", () => {
    it("should return version and date", async () => {
      const response = await request(app).get("/api/interoperation/version");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        version: "1.2.3",
        date: "2025-01-15",
      });
    });
  });
});
