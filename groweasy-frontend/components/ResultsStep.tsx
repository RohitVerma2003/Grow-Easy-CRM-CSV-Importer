"use client";

import { useState } from "react";
import Papa from "papaparse";
import { CRM_FIELD_ORDER, ImportResult } from "@/lib/types";
import { DataTable } from "./DataTable";

interface ResultsStepProps {
  result: ImportResult;
  onStartOver: () => void;
}

type Tab = "imported" | "skipped";

export function ResultsStep({ result, onStartOver }: ResultsStepProps) {
  const [tab, setTab] = useState<Tab>("imported");
  const { imported, skipped, totals } = result;

  function downloadImportedCsv() {
    const csv = Papa.unparse(
      imported.map((record) => Object.fromEntries(CRM_FIELD_ORDER.map((f) => [f, record[f] ?? ""])))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "groweasy-crm-import.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const importedRows = imported.map((r) =>
    Object.fromEntries(CRM_FIELD_ORDER.map((f) => [f, r[f] ?? ""]))
  );
  const skippedRows = skipped.map((s) => ({ reason: s.reason, ...s.row }));
  const skippedColumns =
    skipped.length > 0 ? ["reason", ...Object.keys(skipped[0].row)] : ["reason"];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total rows" value={totals.totalRows} />
        <SummaryCard label="Imported" value={totals.totalImported} tone="signal" />
        <SummaryCard label="Skipped" value={totals.totalSkipped} tone="flag" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--color-surface)" }}>
          <TabButton active={tab === "imported"} onClick={() => setTab("imported")}>
            Imported ({totals.totalImported})
          </TabButton>
          <TabButton active={tab === "skipped"} onClick={() => setTab("skipped")}>
            Skipped ({totals.totalSkipped})
          </TabButton>
        </div>
        <div className="flex gap-2.5">
          {totals.totalImported > 0 && (
            <button
              onClick={downloadImportedCsv}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border transition-colors"
              style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
            >
              Download CSV
            </button>
          )}
          <button
            onClick={onStartOver}
            className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-signal)" }}
          >
            Import another file
          </button>
        </div>
      </div>

      {tab === "imported" ? (
        <DataTable
          columns={CRM_FIELD_ORDER}
          rows={importedRows}
          emptyMessage="No records were imported."
        />
      ) : (
        <DataTable
          columns={skippedColumns}
          rows={skippedRows}
          emptyMessage="Nothing was skipped — every row made it in."
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "signal" | "flag";
}) {
  const color = tone === "signal" ? "var(--color-signal)" : tone === "flag" ? "var(--color-flag)" : "var(--color-ink)";
  return (
    <div className="rounded-lg border px-4 py-3.5" style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}>
      <p className="font-mono text-xs uppercase tracking-wide" style={{ color: "var(--color-ink-soft)" }}>
        {label}
      </p>
      <p className="font-display text-2xl font-semibold mt-1" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide transition-colors"
      style={{
        backgroundColor: active ? "var(--color-paper)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-ink-soft)",
      }}
    >
      {children}
    </button>
  );
}
