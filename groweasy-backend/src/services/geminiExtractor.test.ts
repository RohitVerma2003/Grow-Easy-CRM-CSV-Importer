import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockInvoke, mockWithStructuredOutput } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockWithStructuredOutput: vi.fn(),
}));
mockWithStructuredOutput.mockImplementation(() => ({ invoke: mockInvoke }));

vi.mock("@langchain/google-genai", () => ({
  ChatGoogleGenerativeAI: class {
    withStructuredOutput = mockWithStructuredOutput;
  },
}));

vi.mock("../config/env", () => ({
  env: { geminiApiKey: "test-key", geminiModel: "gemini-2.0-flash" },
}));

import { extractBatch, ExtractionError } from "./geminiExtractor";

describe("extractBatch", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it("returns an empty records array for empty input without calling the model", async () => {
    const result = await extractBatch([]);
    expect(result).toEqual({ records: [] });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("returns mapped records when the model responds with matching count", async () => {
    mockInvoke.mockResolvedValue({ records: [{ email: "a@b.com" }] });
    const result = await extractBatch([{ Email: "a@b.com" }]);
    expect(result.records).toHaveLength(1);
  });

  it("throws ExtractionError when the model call itself fails", async () => {
    mockInvoke.mockRejectedValue(new Error("network down"));
    await expect(extractBatch([{ Email: "a@b.com" }])).rejects.toThrow(ExtractionError);
  });

  it("throws ExtractionError when returned record count doesn't match input row count", async () => {
    mockInvoke.mockResolvedValue({ records: [{ email: "a@b.com" }] });
    await expect(
      extractBatch([{ Email: "a@b.com" }, { Email: "c@d.com" }])
    ).rejects.toThrow(ExtractionError);
  });
});
