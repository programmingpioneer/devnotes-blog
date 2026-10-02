import Link from "next/link";
import type { PostStatus } from "@prisma/client";

export type ProfilePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: Date;
 status: PostStatus;
};

type ProfilePostListProps = {
  posts: ProfilePost[];
  isOwner: boolean;
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function ProfilePostList({
  posts,
  isOwner,
}: ProfilePostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
        <p className="text-sm text-muted">
          {isOwner
            ? "You haven't written any articles yet."
            : "No articles published yet."}
        </p>
        {isOwner && (
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Write your first article
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const isDraft = post.status === "DRAFT";

        return (
          <li key={post.id}>
            <article className="group rounded-xl border border-border bg-background p-5 transition-colors hover:border-accent/40">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="transition-colors group-hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h3>

                {isDraft && isOwner && (
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    Draft
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {post.excerpt}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <time dateTime={post.date.toISOString()}>
                  {formatDate(post.date)}
                </time>

                <Link
                  href={`/posts/${post.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  Read more
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}