interface DataTableProps {
  columns: string[];
  rows: Record<string, string | null | undefined>[];
  columnLabels?: Record<string, string>;
  emptyMessage?: string;
  maxHeight?: string;
}

export function DataTable({
  columns,
  rows,
  columnLabels,
  emptyMessage = "No rows to display.",
  maxHeight = "60vh",
}: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed py-16 font-mono text-sm"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="overflow-auto rounded-lg border"
      style={{ borderColor: "var(--color-line)", maxHeight }}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="sticky top-0 z-10 whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs uppercase tracking-wide border-b"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink-soft)",
                }}
              >
                {columnLabels?.[col] ?? col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors"
              style={{ backgroundColor: i % 2 === 1 ? "var(--color-paper)" : "transparent" }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="whitespace-nowrap px-4 py-2 border-b"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  {row[col] || <span style={{ color: "var(--color-ink-soft)" }}>—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
