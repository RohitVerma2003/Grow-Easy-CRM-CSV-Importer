import { z } from "zod";

/**
 * Fixed enum values dictated by the assignment spec.
 * The AI must map ambiguous statuses/sources into these buckets, or leave blank.
 */
export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

/**
 * A single extracted CRM record, as returned by the AI for one input row.
 * All fields are optional/nullable except the ones needed to prove the row
 * is a valid lead (email or mobile) -- that rule is enforced separately
 * in postProcess, not in this schema, so we can still inspect why a row
 * was skipped.
 */
export const CrmRecordSchema = z.object({
  created_at: z.string().nullable().describe(
    "Lead creation date/time, formatted so it is valid input to JavaScript's `new Date(...)`. Null if not present in source row."
  ),
  name: z.string().nullable().describe("Lead's full name."),
  email: z.string().nullable().describe("Primary email address (first one, if multiple)."),
  country_code: z.string().nullable().describe("Phone country code, e.g. '+91'."),
  mobile_without_country_code: z
    .string()
    .nullable()
    .describe("Primary mobile number without the country code (first one, if multiple)."),
  company: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  lead_owner: z.string().nullable().describe("Email or name of the person/agent owning this lead."),
  crm_status: z
    .enum(CRM_STATUS_VALUES)
    .nullable()
    .describe("Must be exactly one of the allowed enum values, or null if none apply confidently."),
  crm_note: z
    .string()
    .nullable()
    .describe(
      "Remarks, follow-up notes, extra emails/phone numbers, and any useful info that doesn't fit another field."
    ),
  data_source: z
    .enum(DATA_SOURCE_VALUES)
    .nullable()
    .describe("Must be exactly one of the allowed enum values, or null if none match confidently."),
  possession_time: z.string().nullable().describe("Property possession time, if applicable."),
  description: z.string().nullable().describe("Any additional descriptive information."),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;

/**
 * Shape the AI must return for a whole batch: one CRM record per input row,
 * in the same order, so we can zip results back to source rows deterministically.
 */
export const CrmBatchResponseSchema = z.object({
  records: z.array(CrmRecordSchema),
});

export type CrmBatchResponse = z.infer<typeof CrmBatchResponseSchema>;
