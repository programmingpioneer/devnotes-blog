"use client";

import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);

    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion) {
      root.classList.add("theme-transition");
    }

    root.classList.toggle("dark", next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage may be blocked (private mode)
    }

    if (!reduceMotion) {
      window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 320);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-border text-muted transition-token hover:border-accent hover:text-accent"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-token ${
          isDark
            ? "rotate-90 scale-50 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      >
        <SunIcon />
      </span>
      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-token ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-50 opacity-0"
        }`}
      >
        <MoonIcon />
      </span>
    </button>
  );
}