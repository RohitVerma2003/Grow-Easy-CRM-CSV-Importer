"use client";

import { useState } from "react";
import { StepRail, Step } from "@/components/StepRail";
import { UploadStep } from "@/components/UploadStep";
import { PreviewStep } from "@/components/PreviewStep";
import { ProcessingStep } from "@/components/ProcessingStep";
import { ResultsStep } from "@/components/ResultsStep";
import { ThemeToggle } from "@/components/ThemeToggle";
import { parseCsvFile, ParsedCsv, CsvParseError } from "@/lib/csv";
import { importCsv, ApiError } from "@/lib/api";
import { ImportResult } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(selected: File) {
    setError(null);
    try {
      const parsedCsv = await parseCsvFile(selected);
      setFile(selected);
      setParsed(parsedCsv);
      setStep("preview");
    } catch (err) {
      setError(err instanceof CsvParseError ? err.message : "Could not read that file as a CSV.");
    }
  }

  async function handleConfirm() {
    if (!file) return;
    setStep("processing");
    setError(null);
    try {
      const importResult = await importCsv(file);
      setResult(importResult);
      setStep("results");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong during import.");
      setStep("preview");
    }
  }

  function handleStartOver() {
    setFile(null);
    setParsed(null);
    setResult(null);
    setError(null);
    setStep("upload");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: "var(--color-line)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-semibold text-base tracking-tight">GrowEasy</span>
            <span className="font-mono text-xs" style={{ color: "var(--color-ink-soft)" }}>
              csv importer
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <StepRail current={step} />

        {step === "upload" && <UploadStep onFileSelected={handleFileSelected} error={error} />}

        {step === "preview" && parsed && file && (
          <>
            {error && (
              <div
                className="rounded-lg px-4 py-3 font-mono text-sm"
                style={{ backgroundColor: "var(--color-danger-soft)", color: "var(--color-danger)" }}
                role="alert"
              >
                {error}
              </div>
            )}
            <PreviewStep
              parsed={parsed}
              fileName={file.name}
              onConfirm={handleConfirm}
              onBack={handleStartOver}
            />
          </>
        )}

        {step === "processing" && <ProcessingStep rowCount={parsed?.rows.length ?? 0} />}

        {step === "results" && result && (
          <ResultsStep result={result} onStartOver={handleStartOver} />
        )}
      </main>
    </div>
  );
}
