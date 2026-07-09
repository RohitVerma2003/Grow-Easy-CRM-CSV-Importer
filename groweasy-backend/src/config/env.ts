import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  geminiApiKey: required("GEMINI_API_KEY"),
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  batchSize: Number(process.env.BATCH_SIZE ?? 25),
  batchConcurrency: Number(process.env.BATCH_CONCURRENCY ?? 3),
  maxRetries: Number(process.env.MAX_BATCH_RETRIES ?? 2),
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 10 * 1024 * 1024), // 10MB
};
