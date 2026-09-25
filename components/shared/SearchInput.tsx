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
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, tags, topics..."
        aria-label="Search articles"
        autoFocus={autoFocus}
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent"
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