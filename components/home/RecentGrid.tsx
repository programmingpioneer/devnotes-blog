import Link from "next/link";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import TagPill from "@/components/shared/TagPill";
import type { PostMeta } from "@/lib/content/posts";

type RecentGridProps = {
  posts: PostMeta[];
};

export default function RecentGrid({ posts }: RecentGridProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <RevealOnScroll>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          Recent articles
        </h2>
      </RevealOnScroll>

      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-soft-sm">
        {posts.map((post, i) => (
          <RevealOnScroll key={post.slug} delay={i * 60}>
            <Link
              href={`/posts/${post.slug}`}
              className="group block px-5 py-5 transition-token hover:bg-accent/[0.03]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <TagPill key={tag} tag={tag} asLink={false} />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <time dateTime={post.date}>{post.date}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>

              <h3 className="mt-3 text-xl font-semibold tracking-tight transition-token group-hover:text-accent">
                {post.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}