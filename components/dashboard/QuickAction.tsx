import Link from "next/link";
import type { ReactNode } from "react";

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export default function QuickAction({
  href,
  title,
  description,
  icon,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/40 hover:bg-accent/[0.03]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/5 text-accent transition-colors group-hover:border-accent/30"
        aria-hidden
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </Link>
  );
}