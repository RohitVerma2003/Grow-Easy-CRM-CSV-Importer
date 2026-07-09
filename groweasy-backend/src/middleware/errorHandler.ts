import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { CsvParseError } from "../utils/csvParser";

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof CsvParseError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof Error && err.message.includes("Only .csv files")) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error." });
}
