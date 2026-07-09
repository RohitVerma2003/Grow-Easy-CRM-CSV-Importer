"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("groweasy-theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("groweasy-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-8 h-8 flex items-center justify-center rounded-full border font-mono text-sm transition-colors"
      style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
