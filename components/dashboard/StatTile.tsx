import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  value: number;
  icon: ReactNode;
  hint?: string;
};

export default function StatTile({
  label,
  value,
  icon,
  hint,
}: StatTileProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-background p-5 transition-colors hover:border-accent/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 opacity-0 transition-opacity group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted">{hint}</p>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/5 text-accent"
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </div>
  );
}