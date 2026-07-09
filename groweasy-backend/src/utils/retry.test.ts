import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("returns the result immediately on first success", async () => {
    const op = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(op, { maxRetries: 2, baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries after a failure and returns the eventual success", async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail once"))
      .mockResolvedValue("ok");
    const result = await withRetry(op, { maxRetries: 2, baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("throws the last error once retries are exhausted", async () => {
    const op = vi.fn().mockRejectedValue(new Error("always fails"));
    await expect(withRetry(op, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow("always fails");
    expect(op).toHaveBeenCalledTimes(3); // initial attempt + 2 retries
  });

  it("makes exactly one attempt when maxRetries is 0", async () => {
    const op = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(withRetry(op, { maxRetries: 0, baseDelayMs: 1 })).rejects.toThrow("fail");
    expect(op).toHaveBeenCalledTimes(1);
  });
});
