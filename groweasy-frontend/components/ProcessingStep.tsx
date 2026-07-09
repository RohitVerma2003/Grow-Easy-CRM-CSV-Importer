export function ProcessingStep({ rowCount }: { rowCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{
          borderColor: "var(--color-line)",
          borderTopColor: "var(--color-signal)",
        }}
        aria-hidden="true"
      />
      <div className="text-center">
        <p className="font-medium">Mapping {rowCount} row{rowCount === 1 ? "" : "s"} into CRM fields</p>
        <p className="font-mono text-xs mt-1.5" style={{ color: "var(--color-ink-soft)" }}>
          Running AI field extraction in batches — this can take a moment for larger files.
        </p>
      </div>
    </div>
  );
}
