import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { env } from "../config/env";
import { CrmBatchResponse, CrmBatchResponseSchema } from "../schemas/crmRecord.schema";
import { RawCsvRow } from "../types/crm";
import { FEW_SHOT_EXAMPLE, SYSTEM_PROMPT } from "../prompts/systemPrompt";

let cachedModel: ReturnType<typeof buildModel> | null = null;

function buildModel() {
  const model = new ChatGoogleGenerativeAI({
    apiKey: env.geminiApiKey,
    model: env.geminiModel,
    temperature: 0, // deterministic field mapping, not creative generation
  });
  // withStructuredOutput forces the model to return JSON matching our Zod schema
  // (function-calling / JSON-mode under the hood, depending on provider support).
  return model.withStructuredOutput(CrmBatchResponseSchema);
}

function getModel() {
  if (!cachedModel) cachedModel = buildModel();
  return cachedModel;
}

export class ExtractionError extends Error {}

/**
 * Sends one batch of raw CSV rows to Gemini and returns the mapped CRM records,
 * in the same order as the input rows. Callers are responsible for retries.
 */
export async function extractBatch(rows: RawCsvRow[]): Promise<CrmBatchResponse> {
  if (rows.length === 0) return { records: [] };

  const model = getModel();

  const userContent = [
    "Few-shot example of the expected mapping pattern:",
    "INPUT:",
    JSON.stringify(FEW_SHOT_EXAMPLE.input, null, 2),
    "OUTPUT:",
    JSON.stringify(FEW_SHOT_EXAMPLE.output, null, 2),
    "",
    `Now map the following ${rows.length} row(s). Return exactly ${rows.length} record(s), in order:`,
    JSON.stringify(rows, null, 2),
  ].join("\n");

  let response: CrmBatchResponse;
  try {
    response = (await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(userContent),
    ])) as CrmBatchResponse;
  } catch (err) {
    throw new ExtractionError(`Gemini extraction call failed: ${(err as Error).message}`);
  }

  if (response.records.length !== rows.length) {
    throw new ExtractionError(
      `Model returned ${response.records.length} records for ${rows.length} input rows (count mismatch).`
    );
  }

  return response;
}
