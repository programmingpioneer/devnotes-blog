"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = `reveal ${revealed ? "reveal-visible" : ""} ${className}`.trim();

  return (
    <div
      ref={ref}
      className={classes}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}