"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

type Props = {
  status: SaveStatus;
  savedAt: number | null;
};

export default function SaveStatusIndicator({ status, savedAt }: Props) {
  // Force a re-render every ~15s so "Saved just now" can become "Saved 1m ago"
  // without a manual refresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (status !== "saved" || savedAt === null) return;
    const t = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, [status, savedAt]);

  if (status === "idle") return null;

  return (
    <div
      className="flex items-center gap-2 text-xs text-muted"
      aria-live="polite"
    >
      <span
        aria-hidden
        className={cn("h-2 w-2 shrink-0 rounded-full", dotClass(status))}
      />
      <span>{label(status, savedAt)}</span>
    </div>
  );
}

function label(status: SaveStatus, savedAt: number | null): string {
  if (status === "unsaved") return "Unsaved changes";
  if (status === "saving") return "Saving…";
  if (status === "error") return "Save failed";

  // status === "saved"
  if (savedAt === null) return "Saved";
  const elapsed = Math.floor((Date.now() - savedAt) / 1000);
  if (elapsed < 15) return "Saved just now";
  if (elapsed < 60) return `Saved ${elapsed}s ago`;
  const mins = Math.floor(elapsed / 60);
  return `Saved ${mins}m ago`;
}

function dotClass(status: SaveStatus): string {
  switch (status) {
    case "saved":
      return "bg-emerald-500";
    case "saving":
      return "bg-amber-500 animate-pulse";
    case "unsaved":
      return "bg-muted";
    case "error":
      return "bg-red-500";
    default:
      return "bg-transparent";
  }
}