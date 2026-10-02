import Link from "next/link";
import ApproveRejectButtons from "@/components/admin/ApproveRejectButtons";

export type PendingCardData = {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  pillar: string | null;
  createdAt: Date;
  authorName: string;
  tags: string[];
};

function formatTimeAgo(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function PendingCard({ post }: { post: PendingCardData }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-accent/40 hover:shadow-sm">
      <Link
        href={`/admin/posts/${post.id}/preview`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted/10 text-xs text-muted">
            No cover
          </div>
        )}

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-accent">
              {post.title}
            </h3>
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Pending
            </span>
          </div>

          <p className="line-clamp-2 text-xs text-muted">{post.excerpt}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted">
            <span className="truncate">by {post.authorName}</span>
            <span className="shrink-0">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <Link
          href={`/admin/posts/${post.id}`}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
        >
          Edit
        </Link>
        <ApproveRejectButtons postId={post.id} postTitle={post.title} />
      </div>
    </div>
  );
}