import { CrmRecord } from "../schemas/crmRecord.schema";
import { RawCsvRow, SkippedRecord } from "../types/crm";

export interface PostProcessResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

/**
 * Applies the assignment's hard business rules on top of whatever the AI produced:
 *  - skip any record with neither email nor mobile number
 *  - guard against non-Date-parseable created_at values (null it out rather than
 *    fail the whole row, since the spec only requires the *format* be parseable)
 *
 * This is a deliberate safety net: the prompt already asks the model to follow
 * these rules, but we don't trust an LLM alone to enforce hard constraints.
 */
export function postProcessBatch(rows: RawCsvRow[], records: CrmRecord[]): PostProcessResult {
  const imported: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  rows.forEach((row, i) => {
    const record = records[i];

    if (!record) {
      skipped.push({ row, reason: "No record returned by AI for this row." });
      return;
    }

    const hasEmail = Boolean(record.email && record.email.trim() !== "");
    const hasMobile = Boolean(
      record.mobile_without_country_code && record.mobile_without_country_code.trim() !== ""
    );

    if (!hasEmail && !hasMobile) {
      skipped.push({ row, reason: "Record has neither an email nor a mobile number." });
      return;
    }

    const sanitized: CrmRecord = { ...record };
    if (sanitized.created_at) {
      const parsed = new Date(sanitized.created_at);
      if (Number.isNaN(parsed.getTime())) {
        sanitized.created_at = null;
      }
    }

    imported.push(sanitized);
  });

  return { imported, skipped };
}
