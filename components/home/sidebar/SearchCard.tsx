"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchCard() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section
      aria-label="Search articles"
      className="rounded-xl border border-border bg-card p-5 shadow-soft-sm transition-token hover:border-accent/40"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search articles, tags, topics..."
          aria-label="Search articles"
          className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-token hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Search
        </button>
      </form>
    </section>
  );
}