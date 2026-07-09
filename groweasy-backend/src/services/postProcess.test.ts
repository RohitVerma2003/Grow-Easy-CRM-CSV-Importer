import { describe, expect, it } from "vitest";
import { postProcessBatch } from "./postProcess";
import { CrmRecord } from "../schemas/crmRecord.schema";
import { RawCsvRow } from "../types/crm";

function baseRecord(overrides: Partial<CrmRecord> = {}): CrmRecord {
  return {
    created_at: null,
    name: null,
    email: null,
    country_code: null,
    mobile_without_country_code: null,
    company: null,
    city: null,
    state: null,
    country: null,
    lead_owner: null,
    crm_status: null,
    crm_note: null,
    data_source: null,
    possession_time: null,
    description: null,
    ...overrides,
  };
}

const row: RawCsvRow = { name: "irrelevant for these tests" };

describe("postProcessBatch", () => {
  it("imports a record that has an email", () => {
    const { imported, skipped } = postProcessBatch([row], [baseRecord({ email: "a@b.com" })]);
    expect(imported).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it("imports a record that has only a mobile number", () => {
    const { imported, skipped } = postProcessBatch(
      [row],
      [baseRecord({ mobile_without_country_code: "9876543210" })]
    );
    expect(imported).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it("skips a record with neither email nor mobile", () => {
    const { imported, skipped } = postProcessBatch([row], [baseRecord()]);
    expect(imported).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toMatch(/neither an email nor a mobile/i);
  });

  it("treats blank-string email/mobile as absent", () => {
    const { imported, skipped } = postProcessBatch(
      [row],
      [baseRecord({ email: "   ", mobile_without_country_code: "" })]
    );
    expect(imported).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  it("skips and explains when the AI returns no record for a row", () => {
    const { imported, skipped } = postProcessBatch([row], []);
    expect(imported).toHaveLength(0);
    expect(skipped[0].reason).toMatch(/no record returned/i);
  });

  it("nulls out a created_at value that is not Date-parseable", () => {
    const { imported } = postProcessBatch(
      [row],
      [baseRecord({ email: "a@b.com", created_at: "not-a-real-date" })]
    );
    expect(imported[0].created_at).toBeNull();
  });

  it("keeps a valid created_at value untouched", () => {
    const { imported } = postProcessBatch(
      [row],
      [baseRecord({ email: "a@b.com", created_at: "2026-05-13 14:20:48" })]
    );
    expect(imported[0].created_at).toBe("2026-05-13 14:20:48");
  });

  it("processes multiple rows independently, preserving import/skip mix", () => {
    const rows = [row, row, row];
    const records = [
      baseRecord({ email: "a@b.com" }),
      baseRecord(), // no contact info -> skipped
      baseRecord({ mobile_without_country_code: "111" }),
    ];
    const { imported, skipped } = postProcessBatch(rows, records);
    expect(imported).toHaveLength(2);
    expect(skipped).toHaveLength(1);
  });
});
