import { CrmRecord } from "../schemas/crmRecord.schema";

/** A raw row parsed straight from the uploaded CSV, header-keyed, values as strings. */
export type RawCsvRow = Record<string, string>;

export interface SkippedRecord {
  row: RawCsvRow;
  reason: string;
}

export interface ImportResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totals: {
    totalRows: number;
    totalImported: number;
    totalSkipped: number;
  };
}

/** Internal result of processing a single batch through the AI. */
export interface BatchExtractionResult {
  batchIndex: number;
  rows: RawCsvRow[];
  records: CrmRecord[];
  error?: string;
}
