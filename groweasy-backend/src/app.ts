import express, { Express } from "express";
import cors from "cors";
import { importRouter } from "./routes/importRoutes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", importRouter);

  // Must be registered last -- catches errors from all routes above.
  app.use(errorHandler);

  return app;
}
