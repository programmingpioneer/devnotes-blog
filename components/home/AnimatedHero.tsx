"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, stagger } from "animejs";

const HEADING = "Production-level Web Dev & Backend Architecture.";
const SUB =
  "Real case studies, war stories, and engineering notes from shipping software. No fluff. No spin.";

export default function AnimatedHero() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.current
        .querySelectorAll<HTMLElement>(".hero-word, .hero-eyebrow, .hero-sub")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    scope.current = createScope({ root }).add(() => {
      animate(".hero-eyebrow", {
        opacity: [0, 1],
        y: [8, 0],
        duration: 380,
        ease: "out(3)",
      });

      animate(".hero-word", {
        opacity: [0, 1],
        y: [24, 0],
        duration: 560,
        delay: stagger(55, { start: 80 }),
        ease: "out(4)",
      });

      animate(".hero-sub", {
        opacity: [0, 1],
        y: [10, 0],
        duration: 520,
        delay: 420,
        ease: "out(3)",
      });
    });

    return () => {
      scope.current?.revert();
    };
  }, []);

  const words = HEADING.split(" ");

  return (
    <div ref={root}>
      <p
        className="hero-eyebrow text-xs font-medium uppercase tracking-wider text-muted"
        style={{ opacity: 0 }}
      >
        Engineering Notes
      </p>

      <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
        <span
          aria-hidden
          className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
        />
        {words.map((word, i) => (
          <span
            key={i}
            className="hero-word inline-block"
            style={{ opacity: 0 }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </h1>

      <p
        className="hero-sub mt-4 max-w-2xl text-lg text-muted"
        style={{ opacity: 0 }}
      >
        {SUB}
      </p>
    </div>
  );
}