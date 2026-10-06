import Link from "next/link";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import TagPill from "@/components/shared/TagPill";
import EngagementMeta from "@/components/post/EngagementMeta";
import type { PostMeta } from "@/lib/content/posts";

type RecentGridProps = {
  posts: PostMeta[];
  canLike?: boolean;
};

function AuthorAvatar({ image, name }: { image: string | null; name: string }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="h-6 w-6 rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent">
      {initial}
    </span>
  );
}

export default function RecentGrid({ posts, canLike = false }: RecentGridProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <RevealOnScroll>
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Latest Posts</h2>
          <Link
            href="/posts"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        </header>
      </RevealOnScroll>

      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-soft-sm">
        {posts.map((post, i) => {
          const authorName = post.author.name ?? post.author.username ?? "Unknown";
          return (
            <RevealOnScroll key={post.slug} delay={i * 60}>
              <article className="group flex gap-4 px-4 py-5 transition-token hover:bg-accent/3 sm:px-5">
                                 <Link
                  href={`/posts/${post.slug}`}
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/5 sm:h-24 sm:w-24"
                  aria-label={post.title}
                >
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt=""
                      loading="lazy"
                      className="block h-full w-full object-contain"
                    />
                  ) : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <TagPill key={tag} tag={tag} asLink={false} />
                    ))}
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-base font-semibold tracking-tight transition-token sm:text-lg">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="transition-colors group-hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <AuthorAvatar image={post.author.image} name={authorName} />
                      <span className="font-medium text-foreground/80">
                        {authorName}
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={post.date}>{post.date}</time>
                      <span aria-hidden>·</span>
                      <span>{post.readingTime}</span>
                    </div>

                    <EngagementMeta
                      slug={post.slug}
                      views={post.views}
                      likes={post.likes}
                      likedByMe={post.likedByMe}
                      canLike={canLike}
                    />
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}