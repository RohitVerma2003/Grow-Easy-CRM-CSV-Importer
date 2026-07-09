"use client";

import { useCallback, useRef, useState } from "react";

interface UploadStepProps {
  onFileSelected: (file: File) => void;
  error?: string | null;
}

export function UploadStep({ onFileSelected, error }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        onFileSelected(file); // let parent surface the "only .csv" error via parse failure
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-20 text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2"
        style={{
          borderColor: isDragging ? "var(--color-signal)" : "var(--color-line)",
          backgroundColor: isDragging ? "var(--color-signal-soft)" : "var(--color-surface)",
        }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full font-mono text-lg"
          style={{ backgroundColor: "var(--color-signal-soft)", color: "var(--color-signal)" }}
          aria-hidden="true"
        >
          ↑
        </div>
        <div>
          <p className="font-medium text-base">Drop a CSV file here, or click to browse</p>
          <p className="font-mono text-xs mt-1.5" style={{ color: "var(--color-ink-soft)" }}>
            Any column layout works — we'll figure out the mapping.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 font-mono text-sm"
          style={{ backgroundColor: "var(--color-danger-soft)", color: "var(--color-danger)" }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
