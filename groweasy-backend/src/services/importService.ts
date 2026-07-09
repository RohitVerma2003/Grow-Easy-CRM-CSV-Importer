import { env } from "../config/env";
import { parseCsv } from "../utils/csvParser";
import { chunkArray, runWithConcurrency } from "../utils/batcher";
import { withRetry } from "../utils/retry";
import { extractBatch } from "./geminiExtractor";
import { postProcessBatch } from "./postProcess";
import { BatchExtractionResult, ImportResult, RawCsvRow, SkippedRecord } from "../types/crm";

/**
 * Full pipeline: raw CSV buffer -> parsed rows -> batched AI extraction (with
 * retry + bounded concurrency) -> business-rule post-processing -> final result.
 * Stateless throughout -- nothing is persisted.
 */
export async function importCsv(fileBuffer: Buffer): Promise<ImportResult> {
  const rows = parseCsv(fileBuffer);
  const batches = chunkArray(rows, env.batchSize);

  const batchResults = await runWithConcurrency(batches, env.batchConcurrency, async (batchRows, batchIndex) =>
    processBatch(batchRows, batchIndex)
  );

  const imported: ImportResult["imported"] = [];
  const skipped: SkippedRecord[] = [];

  for (const result of batchResults) {
    if (result.error) {
      // Whole batch failed even after retries -- skip every row in it individually
      // with the failure reason, rather than failing the entire import.
      for (const row of result.rows) {
        skipped.push({ row, reason: result.error });
      }
      continue;
    }

    const { imported: batchImported, skipped: batchSkipped } = postProcessBatch(result.rows, result.records);
    imported.push(...batchImported);
    skipped.push(...batchSkipped);
  }

  return {
    imported,
    skipped,
    totals: {
      totalRows: rows.length,
      totalImported: imported.length,
      totalSkipped: skipped.length,
    },
  };
}

async function processBatch(rows: RawCsvRow[], batchIndex: number): Promise<BatchExtractionResult> {
  try {
    const response = await withRetry(() => extractBatch(rows), { maxRetries: env.maxRetries });
    return { batchIndex, rows, records: response.records };
  } catch (err) {
    return {
      batchIndex,
      rows,
      records: [],
      error: `AI extraction failed after retries: ${(err as Error).message}`,
    };
  }
}
