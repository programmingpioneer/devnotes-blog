"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, createScope, stagger } from "animejs";
import PostCard from "@/components/post/PostCard";
import LiveSearch from "@/components/shared/LiveSearch";
import type { PostMeta } from "@/lib/content/posts";

const HEADING_TOP = "Better Ideas for";
const HEADING_BOTTOM = "Better Developers";
const SUB =
  "Read, write and share knowledge. DevNotes is a modern blog platform for developers, creators and tech enthusiasts.";
const TAG_PILLS = ["Next.js", "React", "TypeScript", "Web Development", "Technology"];

type HomeHeroProps = {
  featured: PostMeta;
  canLike?: boolean;
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

export default function HomeHero({ featured, canLike = false }: HomeHeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!root.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.current
        .querySelectorAll<HTMLElement>(".hero-eyebrow, .hero-word, .hero-sub, .hero-extra")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    scope.current = createScope({ root }).add(() => {
      animate(".hero-eyebrow", { opacity: [0, 1], y: [8, 0], duration: 380, ease: "out(3)" });
      animate(".hero-word", { opacity: [0, 1], y: [24, 0], duration: 560, delay: stagger(55, { start: 80 }), ease: "out(4)" });
      animate(".hero-sub", { opacity: [0, 1], y: [10, 0], duration: 520, delay: 420, ease: "out(3)" });
      animate(".hero-extra", { opacity: [0, 1], y: [10, 0], duration: 460, delay: stagger(80, { start: 560 }), ease: "out(3)" });
    });

    return () => {
      scope.current?.revert();
    };
  }, []);

  const wordsTop = HEADING_TOP.split(" ");
  const wordsBottom = HEADING_BOTTOM.split(" ");

  return (
    <div ref={root} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
      <div className="min-w-0">
        <p className="hero-eyebrow text-xs font-medium uppercase tracking-wider text-accent" style={{ opacity: 0 }}>
          {"// Engineering Notes"}
        </p>

        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          <span className="block whitespace-nowrap">
            {wordsTop.map((word, i) => (
              <span key={`t-${i}`} className="hero-word inline-block" style={{ opacity: 0 }}>
                {word}
                {i < wordsTop.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </span>
          <span className="mt-1 block whitespace-nowrap text-accent">
            {wordsBottom.map((word, i) => (
              <span key={`b-${i}`} className="hero-word inline-block" style={{ opacity: 0 }}>
                {word}
                {i < wordsBottom.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </span>
        </h1>

        <p className="hero-sub mt-5 max-w-2xl text-base text-muted sm:text-lg" style={{ opacity: 0 }}>
          {SUB}
        </p>

        <div className="hero-extra relative z-30 mt-6" style={{ opacity: 0 }}>
          <LiveSearch />
        </div>

        <div className="hero-extra mt-5 flex flex-wrap gap-2" style={{ opacity: 0 }}>
          {TAG_PILLS.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slugify(tag)}`}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted transition-token hover:border-accent/40 hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        <p className="hero-extra mt-6 flex items-center gap-2 text-sm text-muted" style={{ opacity: 0 }}>
          <span aria-hidden className="text-accent">⚡</span>
          <span>
            <span className="font-medium text-foreground">Latest:</span> Stay updated with new posts and fresh ideas.
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <PostCard post={featured} variant="hero" canLike={canLike} />
      </div>
    </div>
  );
}