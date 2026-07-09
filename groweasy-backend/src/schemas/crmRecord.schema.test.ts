import { describe, expect, it } from "vitest";
import { CrmRecordSchema, CrmBatchResponseSchema } from "./crmRecord.schema";

const validRecord = {
  created_at: "2026-05-13 14:20:48",
  name: "John Doe",
  email: "john.doe@example.com",
  country_code: "+91",
  mobile_without_country_code: "9876543210",
  company: "GrowEasy",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  lead_owner: "test@gmail.com",
  crm_status: "GOOD_LEAD_FOLLOW_UP",
  crm_note: "Client is asking to reschedule demo",
  data_source: null,
  possession_time: null,
  description: null,
};

describe("CrmRecordSchema", () => {
  it("accepts a fully valid record", () => {
    expect(CrmRecordSchema.safeParse(validRecord).success).toBe(true);
  });

  it("accepts a record with all-null optional fields", () => {
    const allNull = Object.fromEntries(Object.keys(validRecord).map((k) => [k, null]));
    expect(CrmRecordSchema.safeParse(allNull).success).toBe(true);
  });

  it("rejects an invalid crm_status value", () => {
    const result = CrmRecordSchema.safeParse({ ...validRecord, crm_status: "MAYBE_INTERESTED" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid data_source value", () => {
    const result = CrmRecordSchema.safeParse({ ...validRecord, data_source: "random_source" });
    expect(result.success).toBe(false);
  });

  it("rejects a record missing a required key", () => {
    const { name, ...withoutName } = validRecord;
    const result = CrmRecordSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });
});

describe("CrmBatchResponseSchema", () => {
  it("accepts an array of valid records", () => {
    const result = CrmBatchResponseSchema.safeParse({ records: [validRecord] });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    expect(CrmBatchResponseSchema.safeParse({ records: [] }).success).toBe(true);
  });

  it("rejects a response where any record is invalid", () => {
    const result = CrmBatchResponseSchema.safeParse({
      records: [validRecord, { ...validRecord, crm_status: "NOT_ALLOWED" }],
    });
    expect(result.success).toBe(false);
  });
});
