"use client";

import Link from "next/link";
import { useLikeToggle } from "./useLikeToggle";

type LikeButtonProps = {
  slug: string;
  initialLikes: number;
  initialLikedByMe: boolean;
  canLike: boolean;
};

export default function LikeButton({
  slug,
  initialLikes,
  initialLikedByMe,
  canLike,
}: LikeButtonProps) {
  const { likes, likedByMe, pending, toggle } = useLikeToggle({
    slug,
    initialLikes,
    initialLikedByMe,
  });

  if (!canLike) {
    return (
      <Link
        href={`/login?next=/posts/${slug}`}
        className="inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        aria-label="Sign in to like this post"
      >
        <HeartIcon filled={false} />
        <span>{likes.toLocaleString()}</span>
        <span>Sign in to like</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? "Unlike this post" : "Like this post"}
      className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        likedByMe
          ? "border-accent bg-accent/10 text-accent hover:bg-accent/15"
          : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <HeartIcon filled={likedByMe} />
      <span>{likes.toLocaleString()}</span>
      <span>{likedByMe ? "Liked" : "Like"}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}