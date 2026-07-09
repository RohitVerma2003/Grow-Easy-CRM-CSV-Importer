import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockExtractBatch } = vi.hoisted(() => ({ mockExtractBatch: vi.fn() }));

vi.mock("./geminiExtractor", () => ({
  extractBatch: mockExtractBatch,
}));

vi.mock("../config/env", () => ({
  env: { batchSize: 2, batchConcurrency: 2, maxRetries: 1 },
}));

import { importCsv } from "./importService";

function csv(rows: string[]): Buffer {
  return Buffer.from(["Name,Email", ...rows].join("\n"));
}

describe("importCsv", () => {
  beforeEach(() => {
    mockExtractBatch.mockReset();
  });

  it("imports all rows when the AI maps every one successfully", async () => {
    mockExtractBatch.mockResolvedValue({
      records: [{ email: "a@b.com" }],
    });
    const result = await importCsv(csv(["Alice,a@b.com"]));
    expect(result.totals).toEqual({ totalRows: 1, totalImported: 1, totalSkipped: 0 });
  });

  it("splits rows across multiple batches according to batchSize", async () => {
    mockExtractBatch.mockImplementation(async (rows: unknown[]) => ({
      records: rows.map(() => ({ email: "x@y.com" })),
    }));
    // batchSize is mocked to 2, so 3 rows -> 2 batches
    const result = await importCsv(
      csv(["A,a@b.com", "B,b@b.com", "C,c@b.com"])
    );
    expect(mockExtractBatch).toHaveBeenCalledTimes(2);
    expect(result.totals.totalImported).toBe(3);
  });

  it("skips rows from a batch that fails even after retries, with a clear reason", async () => {
    mockExtractBatch.mockRejectedValue(new Error("model unavailable"));
    const result = await importCsv(csv(["Alice,a@b.com"]));
    expect(result.imported).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toMatch(/AI extraction failed after retries/i);
    // maxRetries mocked to 1 -> initial attempt + 1 retry = 2 calls
    expect(mockExtractBatch).toHaveBeenCalledTimes(2);
  });

  it("recovers a batch that fails once then succeeds on retry", async () => {
    mockExtractBatch
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce({ records: [{ email: "a@b.com" }] });
    const result = await importCsv(csv(["Alice,a@b.com"]));
    expect(result.totals).toEqual({ totalRows: 1, totalImported: 1, totalSkipped: 0 });
  });

  it("applies business-rule skipping (no email/mobile) on top of AI output", async () => {
    mockExtractBatch.mockResolvedValue({ records: [{ email: null, mobile_without_country_code: null }] });
    const result = await importCsv(csv(["Ghost,"]));
    expect(result.imported).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
  });

  it("throws when the CSV has no data rows", async () => {
    await expect(importCsv(Buffer.from("Name,Email\n"))).rejects.toThrow();
  });
});
