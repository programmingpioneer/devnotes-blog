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
          ? "group flex flex-col gap-4 rounded-lg border border-border p-6 transition-colors hover:border-accent md:p-8"
          : "group flex flex-col gap-3 rounded-lg border border-border p-5 transition-colors hover:border-accent"
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
            ? "text-2xl font-semibold tracking-tight md:text-3xl"
            : "text-lg font-semibold tracking-tight"
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