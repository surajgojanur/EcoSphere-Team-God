import { Router } from "express";
import { assertDatabaseReady } from "../db/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ecosphere-backend",
    timestamp: new Date().toISOString()
  });
});

healthRouter.get("/ready", async (_req, res) => {
  try {
    await assertDatabaseReady();
    res.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(503).json({
      status: "not_ready",
      database: "unavailable",
      timestamp: new Date().toISOString()
    });
  }
});
