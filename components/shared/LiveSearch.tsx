"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn, formatCount } from "@/lib/utils";

const MAX_VISIBLE = 5;
const DEBOUNCE_MS = 300;

type SearchResult = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  coverImage: string | null;
  views: number;
  likes: number;
  author: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
  score: number;
};

type SearchResponse = {
  query: string;
  count: number;
  results: SearchResult[];
};

function initialsOf(name: string | null, username: string | null): string {
  const source = (name ?? username ?? "?").trim();
  return (
    source
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function LiveSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();

    if (!q) {
      abortRef.current?.abort();
      setResults([]);
      setCount(0);
      setOpen(false);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search request failed");
        const data: SearchResponse = await res.json();
        setResults(data.results);
        setCount(data.count);
        setOpen(true);
        setActiveIndex(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(true);
          setResults([]);
          setCount(0);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey as EventListener);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey as EventListener);
    };
  }, [open]);

  const visible = results.slice(0, MAX_VISIBLE);
  const showSeeAll = count > MAX_VISIBLE;
  const trimmed = query.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || visible.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const item = visible[activeIndex];
      if (item) {
        e.preventDefault();
        window.location.href = `/posts/${item.slug}`;
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <form onSubmit={handleSubmit} role="search" className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || error) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder="Search articles, tags, topics..."
          aria-label="Search articles"
          aria-expanded={open}
          aria-controls="live-search-results"
          aria-autocomplete="list"
          role="combobox"
          className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-token hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Search
        </button>
      </form>

      {open && (
        <div
          id="live-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-soft-md"
        >
          {loading && (
            <div className="p-4 text-sm text-muted">Searching…</div>
          )}

          {!loading && error && (
            <div className="p-4 text-sm text-muted">
              Search failed. Please try again.
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="p-4 text-sm text-muted">
              No results for{" "}
              <span className="text-foreground">&quot;{trimmed}&quot;</span>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <ul className="divide-y divide-border">
              {visible.map((r, i) => (
                <li key={r.slug}>
                  <Link
                    href={`/posts/${r.slug}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex gap-3 p-3 transition-colors",
                      i === activeIndex ? "bg-subtle" : "hover:bg-subtle"
                    )}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-accent/30 via-accent/10 to-background">
                      {r.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {r.excerpt}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-[9px] font-semibold text-accent">
                          {initialsOf(r.author.name, r.author.username)}
                        </span>
                        <span className="truncate">
                          {r.author.name ?? r.author.username ?? "Anonymous"}
                        </span>
                        <span aria-hidden>·</span>
                        <span>{formatCount(r.views)} views</span>
                        <span aria-hidden>·</span>
                        <span>{formatCount(r.likes)} likes</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && showSeeAll && (
            <Link
              href={`/search?q=${encodeURIComponent(trimmed)}`}
              onClick={() => setOpen(false)}
              className="block border-t border-border px-3 py-2.5 text-center text-xs font-medium text-accent transition-colors hover:bg-subtle"
            >
              See all {count} results →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}