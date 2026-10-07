import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "warning" | "success" | "error" | "info";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "border-border bg-muted/10 text-muted",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-info/30 bg-info/10 text-info",
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-muted",
  warning: "bg-warning",
  success: "bg-success",
  error: "bg-error",
  info: "bg-info",
};

type BadgeProps = {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  pill?: boolean;
  dot?: boolean;
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function Badge({
  variant = "neutral",
  size = "md",
  pill = false,
  dot = false,
  title,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium",
        pill ? "rounded-full" : "rounded-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}