import multer from "multer";
import { env } from "../config/env";

const storage = multer.memoryStorage(); // stateless -- never touches disk

export const csvUpload = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeBytes },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      cb(new Error("Only .csv files are accepted."));
      return;
    }
    cb(null, true);
  },
});
