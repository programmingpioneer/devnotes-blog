"use client";

import { useState } from "react";

type UseLikeToggleArgs = {
  slug: string;
  initialLikes: number;
  initialLikedByMe: boolean;
};

type UseLikeToggleResult = {
  likes: number;
  likedByMe: boolean;
  pending: boolean;
  toggle: () => Promise<void>;
};

export function useLikeToggle({
  slug,
  initialLikes,
  initialLikedByMe,
}: UseLikeToggleArgs): UseLikeToggleResult {
  const [likes, setLikes] = useState(initialLikes);
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    const nextLiked = !likedByMe;
    const optimisticLikes = Math.max(0, likes + (nextLiked ? 1 : -1));
    setLikedByMe(nextLiked);
    setLikes(optimisticLikes);

    try {
      const res = await fetch(`/api/posts/${slug}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { likes: number; likedByMe: boolean } = await res.json();
      setLikes(data.likes);
      setLikedByMe(data.likedByMe);
    } catch {
      // Revert optimistic update on failure.
      setLikedByMe(!nextLiked);
      setLikes(likes);
    } finally {
      setPending(false);
    }
  }

  return { likes, likedByMe, pending, toggle };
}