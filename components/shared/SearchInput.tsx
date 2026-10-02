"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SearchInputProps = {
  autoFocus?: boolean;
};

export default function SearchInput({ autoFocus = false }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = value.trim();
      const current = searchParams.get("q") ?? "";
      if (trimmed === current) return;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, tags, topics..."
        aria-label="Search articles"
        autoFocus={autoFocus}
        className="w-full rounded-md border border-border bg-background py-3.5 pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-xs text-muted hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}