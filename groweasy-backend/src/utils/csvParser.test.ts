import { describe, expect, it } from "vitest";
import { parseCsv, CsvParseError } from "./csvParser";

describe("parseCsv", () => {
  it("parses a well-formed CSV into header-keyed rows", () => {
    const csv = "name,email\nJohn Doe,john@example.com";
    const rows = parseCsv(csv);
    expect(rows).toEqual([{ name: "John Doe", email: "john@example.com" }]);
  });

  it("preserves arbitrary/non-standard column names as-is", () => {
    const csv = "Full Name,Ph No\nJane,12345";
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ "Full Name": "Jane", "Ph No": "12345" });
  });

  it("trims whitespace from headers and values", () => {
    const csv = " name , email \n John , john@example.com ";
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ name: "John", email: "john@example.com" });
  });

  it("drops fully-empty rows", () => {
    const csv = "name,email\nJohn,john@example.com\n,\n";
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
  });

  it("throws CsvParseError when there are no data rows", () => {
    const csv = "name,email\n";
    expect(() => parseCsv(csv)).toThrow(CsvParseError);
  });

  it("accepts a Buffer as well as a string", () => {
    const csv = Buffer.from("name,email\nJohn,john@example.com");
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
  });
});
