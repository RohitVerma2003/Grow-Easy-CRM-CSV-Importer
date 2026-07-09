import { NextFunction, Request, Response } from "express";
import { importCsv } from "../services/importService";
import { HttpError } from "../middleware/errorHandler";

export async function handleImport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new HttpError(400, "No CSV file uploaded. Expected multipart field 'file'.");
    }

    const result = await importCsv(req.file.buffer);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
