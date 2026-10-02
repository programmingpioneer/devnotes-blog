import Link from "next/link";
import TagPill from "@/components/shared/TagPill";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
};

type PostCardProps = {
  post: PostCardData;
  variant?: "default" | "featured";
};

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const isFeatured = variant === "featured";

  return (
    <article
      className={
        isFeatured
          ? "group flex flex-col gap-4 rounded-lg border border-border border-l-4 border-l-accent bg-accent/[0.03] p-6 shadow-soft-md transition-token hover:-translate-y-0.5 hover:border-accent md:p-8"
          : "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent hover:shadow-soft-md"
      }
    >
      <div className="flex flex-wrap gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <TagPill key={tag} tag={tag} asLink={false} />
        ))}
      </div>

      <h3
        className={
          isFeatured
            ? "text-3xl font-semibold tracking-tight md:text-4xl"
            : "text-base font-semibold tracking-tight"
        }
      >
        <Link
          href={`/posts/${post.slug}`}
          className="transition-colors group-hover:text-accent"
        >
          {post.title}
        </Link>
      </h3>

      <p className="text-sm leading-relaxed text-muted">{post.excerpt}</p>

      <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted">
        <time dateTime={post.date}>{post.date}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
      </div>
    </article>
  );
}