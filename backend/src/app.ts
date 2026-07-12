import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./common/middleware.js";
import { AppError } from "./common/errors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/api.js";
import { healthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: env.CORS_ORIGIN
    })
  );
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(morgan(":method :url :status :response-time ms"));

  app.use(healthRouter);
  app.use("/api/v1", healthRouter);
  app.use("/api/v1", apiRouter);

  app.use((_req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", "Route not found."));
  });

  app.use(errorHandler);

  return app;
}
