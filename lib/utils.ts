import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compact count formatter for view/like counts.
 * <1000 → raw ("999")
 * <1e6  → "1.2k" (trailing .0 stripped: 1000 → "1k")
 * else  → "1.5M"
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/**
 * Human-readable view count with correct singular/plural.
 * 0 → "0 views", 1 → "1 view", 2 → "2 views", 1200 → "1.2k views"
 */
export function formatViewLabel(n: number): string {
  return `${formatCount(n)} ${n === 1 ? "view" : "views"}`;
}