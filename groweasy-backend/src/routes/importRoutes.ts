import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import { handleImport } from "../controllers/importController";

export const importRouter = Router();

// POST /api/import  (multipart/form-data, field name: "file")
importRouter.post("/import", csvUpload.single("file"), handleImport);
