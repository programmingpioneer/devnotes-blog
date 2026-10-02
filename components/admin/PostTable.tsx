import Link from "next/link";
import DeletePostButton from "./DeletePostButton";
import type { PostStatus } from "@prisma/client";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: PostStatus;
  pillar: string | null;
  date: Date;
  updatedAt: Date;
  author: { name: string | null; username: string | null } | null;
  tags: string[];
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function StatusBadge({ status }: { status: PostStatus }) {
  const map: Record<PostStatus, { label: string; className: string }> = {
    DRAFT: {
      label: "Draft",
      className:
        "border-border bg-muted/10 text-muted",
    },
    PENDING_REVIEW: {
      label: "Pending",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    PUBLISHED: {
      label: "Published",
      className:
        "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    },
  };
  const cfg = map[status];
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export default function PostTable({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted">No posts yet.</p>
        <Link
          href="/admin/posts/new"
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/5 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Author</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((post) => (
            <tr
              key={post.id}
              className="transition-colors hover:bg-muted/5"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/posts/${post.id}/preview`}
                  className="font-medium hover:text-accent"
                >
                  {post.title}
                </Link>
                {post.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="hidden px-4 py-3 text-muted md:table-cell">
                {post.author?.name ?? post.author?.username ?? "—"}
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {formatDate(post.date)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={post.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="rounded-md border border-border px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                  >
                    Edit
                  </Link>
                  <DeletePostButton postId={post.id} title={post.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}