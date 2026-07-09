"use client";

import { ParsedCsv } from "@/lib/csv";
import { DataTable } from "./DataTable";

interface PreviewStepProps {
  parsed: ParsedCsv;
  fileName: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function PreviewStep({ parsed, fileName, onConfirm, onBack }: PreviewStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-medium">{fileName}</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
            {parsed.rows.length} row{parsed.rows.length === 1 ? "" : "s"} · {parsed.headers.length} column
            {parsed.headers.length === 1 ? "" : "s"} detected
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border transition-colors"
            style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
          >
            Choose different file
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-signal)" }}
          >
            Confirm &amp; import →
          </button>
        </div>
      </div>

      <DataTable columns={parsed.headers} rows={parsed.rows} />

      <p className="font-mono text-xs" style={{ color: "var(--color-ink-soft)" }}>
        This is exactly what was found in your file — nothing has been sent anywhere yet.
      </p>
    </div>
  );
}
