"use client";

import { formatCount, formatViewLabel } from "@/lib/utils";
import { useLikeToggle } from "./useLikeToggle";

type EngagementMetaProps = {
  slug: string;
  views: number;
  likes: number;
  likedByMe?: boolean;
  canLike?: boolean;
  size?: "sm" | "md";
};

export default function EngagementMeta({
  slug,
  views,
  likes,
  likedByMe = false,
  canLike = false,
  size = "sm",
}: EngagementMetaProps) {
  const {
    likes: currentLikes,
    likedByMe: currentLiked,
    pending,
    toggle,
  } = useLikeToggle({
    slug,
    initialLikes: likes,
    initialLikedByMe: likedByMe,
  });

  const iconCls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const textCls = size === "md" ? "text-sm" : "text-xs";
  const gapCls = size === "md" ? "gap-4" : "gap-3";

  return (
    <div className={`flex items-center ${gapCls} ${textCls} text-muted`}>
      <span
        className="flex items-center gap-1"
        role="img"
        aria-label={formatViewLabel(views)}
      >
        <EyeIcon className={iconCls} />
        <span aria-hidden="true">{formatCount(views)}</span>
      </span>

      {canLike ? (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={currentLiked}
          aria-label={currentLiked ? "Unlike this post" : "Like this post"}
          className={`flex items-center gap-1 transition-colors disabled:opacity-60 ${
            currentLiked ? "text-accent" : "hover:text-accent"
          }`}
        >
          <HeartIcon className={iconCls} filled={currentLiked} />
          <span>{formatCount(currentLikes)}</span>
        </button>
      ) : (
        <span
          className="flex items-center gap-1"
          role="img"
          aria-label={`${currentLikes} ${currentLikes === 1 ? "like" : "likes"}`}
        >
          <HeartIcon className={iconCls} filled={currentLiked} />
          <span aria-hidden="true">{formatCount(currentLikes)}</span>
        </span>
      )}
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}