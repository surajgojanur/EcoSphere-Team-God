import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

test("GET /health returns process health", async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://ecosphere:ecosphere_dev_password@localhost:5432/ecosphere";
  process.env.JWT_SECRET = "test-development-secret-value";
  process.env.CORS_ORIGIN = "http://localhost:3000";

  const { createApp } = await import("../src/app.js");
  const response = await request(createApp()).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "ecosphere-backend");
});
