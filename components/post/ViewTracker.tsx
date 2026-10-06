"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch(`/api/posts/${slug}/view`, { method: "POST" }).catch(() => {
      // Best-effort. No user-facing error; view count is non-critical.
    });
  }, [slug]);

  return null;
}