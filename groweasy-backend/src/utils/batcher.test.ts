import { describe, expect, it } from "vitest";
import { chunkArray, runWithConcurrency } from "./batcher";

describe("chunkArray", () => {
  it("splits evenly divisible arrays into equal chunks", () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("puts the remainder in a final smaller chunk", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns an empty array for empty input", () => {
    expect(chunkArray([], 5)).toEqual([]);
  });

  it("returns a single chunk when size exceeds array length", () => {
    expect(chunkArray([1, 2], 10)).toEqual([[1, 2]]);
  });

  it("throws for a non-positive chunk size", () => {
    expect(() => chunkArray([1, 2], 0)).toThrow();
  });
});

describe("runWithConcurrency", () => {
  it("preserves result order regardless of completion order", async () => {
    const items = [30, 10, 20];
    const results = await runWithConcurrency(items, 3, async (ms) => {
      await new Promise((r) => setTimeout(r, ms));
      return ms;
    });
    expect(results).toEqual([30, 10, 20]);
  });

  it("processes all items when concurrency exceeds item count", async () => {
    const results = await runWithConcurrency([1, 2], 10, async (n) => n * 2);
    expect(results).toEqual([2, 4]);
  });

  it("returns an empty array for empty input", async () => {
    const results = await runWithConcurrency<number, number>([], 3, async (n) => n);
    expect(results).toEqual([]);
  });

  it("propagates a worker error", async () => {
    await expect(
      runWithConcurrency([1, 2], 2, async (n) => {
        if (n === 2) throw new Error("boom");
        return n;
      })
    ).rejects.toThrow("boom");
  });
});
