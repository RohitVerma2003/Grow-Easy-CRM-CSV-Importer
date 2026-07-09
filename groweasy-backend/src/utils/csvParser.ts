import Papa from "papaparse";
import { RawCsvRow } from "../types/crm";

export class CsvParseError extends Error {}

/**
 * Parses a raw CSV buffer/string into header-keyed row objects.
 * Does NOT assume any fixed set of column names -- whatever headers
 * are present become the object keys, exactly as the assignment requires.
 */
export function parseCsv(input: Buffer | string): RawCsvRow[] {
  const content = typeof input === "string" ? input : input.toString("utf-8");

  const result = Papa.parse<RawCsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  if (result.errors && result.errors.length > 0) {
    // Papa reports row-level errors (e.g. malformed quotes) but can often still
    // recover partial data. We only hard-fail if nothing was parsed at all.
    if (!result.data || result.data.length === 0) {
      const messages = result.errors.map((e) => `${e.type}: ${e.message} (row ${e.row})`).join("; ");
      throw new CsvParseError(`Failed to parse CSV: ${messages}`);
    }
  }

  if (!result.data || result.data.length === 0) {
    throw new CsvParseError("CSV contains no data rows.");
  }

  // Drop fully-empty rows (all values blank) that sometimes survive parsing.
  return result.data.filter((row) => Object.values(row).some((v) => v && v.toString().trim() !== ""));
}
