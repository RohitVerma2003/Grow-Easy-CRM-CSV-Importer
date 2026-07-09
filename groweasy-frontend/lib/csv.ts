import Papa from "papaparse";
import { RawCsvRow } from "./types";

export interface ParsedCsv {
  headers: string[];
  rows: RawCsvRow[];
}

export class CsvParseError extends Error {}

/**
 * Parses a File client-side for the preview step. Mirrors the backend's
 * parsing rules (trimmed headers/values, header-agnostic) so the preview
 * the user sees matches what the backend will actually receive.
 */
export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => (typeof value === "string" ? value.trim() : value),
      complete: (result) => {
        const rows = (result.data || []).filter((row) =>
          Object.values(row).some((v) => v && v.toString().trim() !== "")
        );

        if (rows.length === 0) {
          reject(new CsvParseError("This CSV has no data rows."));
          return;
        }

        resolve({ headers: result.meta.fields ?? [], rows });
      },
      error: (err: Error) => reject(new CsvParseError(err.message)),
    });
  });
}
