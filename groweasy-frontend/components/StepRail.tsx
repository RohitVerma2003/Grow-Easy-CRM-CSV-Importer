export type Step = "upload" | "preview" | "processing" | "results";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "processing", label: "Confirm" },
  { key: "results", label: "Results" },
];

export function StepRail({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center w-full" aria-label="Import progress">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={[
                  "flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs shrink-0 border transition-colors",
                  isDone
                    ? "bg-signal border-signal text-white"
                    : isActive
                      ? "border-signal text-signal"
                      : "border-line text-ink-soft",
                ].join(" ")}
                style={{
                  backgroundColor: isDone ? "var(--color-signal)" : "transparent",
                  borderColor: isDone || isActive ? "var(--color-signal)" : "var(--color-line)",
                  color: isDone ? "#fff" : isActive ? "var(--color-signal)" : "var(--color-ink-soft)",
                }}
                aria-hidden="true"
              >
                {isDone ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-mono text-xs tracking-wide uppercase hidden sm:inline"
                style={{ color: isActive ? "var(--color-ink)" : "var(--color-ink-soft)" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="flex-1 h-px mx-3"
                style={{
                  backgroundImage: isDone
                    ? "none"
                    : "repeating-linear-gradient(to right, var(--color-line) 0, var(--color-line) 4px, transparent 4px, transparent 8px)",
                  backgroundColor: isDone ? "var(--color-signal)" : "transparent",
                }}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
