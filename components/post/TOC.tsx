"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content/headings";
import { cn } from "@/lib/utils";

type TOCProps = {
  headings: Heading[];
};

export default function TOC({ headings }: TOCProps) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
        On this page
      </p>
      <ul className="space-y-0.5">
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li
              key={h.id}
              style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            >
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block w-full break-words border-l-2 py-1 pl-3 pr-2 text-[13px] leading-snug transition-colors",
                  isActive
                    ? "border-accent font-medium text-accent"
                    : "border-transparent text-muted hover:border-border hover:text-foreground"
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}