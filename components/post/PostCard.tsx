import Link from "next/link";
import TagPill from "@/components/shared/TagPill";
import EngagementMeta from "@/components/post/EngagementMeta";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  coverImage?: string | null;
  views?: number;
  likes?: number;
  likedByMe?: boolean;
  canLike?: boolean;
  author?: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

type PostCardProps = {
  post: PostCardData;
  variant?: "default" | "featured" | "hero";
  canLike?: boolean;
};

function AuthorAvatar({
  image,
  name,
  size = "sm",
}: {
  image: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const cls = size === "md" ? "h-7 w-7 text-xs" : "h-6 w-6 text-[10px]";
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`${cls} rounded-full object-cover`}
        loading="lazy"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`${cls} flex items-center justify-center rounded-full bg-accent/15 font-semibold text-accent`}
    >
      {initial}
    </span>
  );
}

export default function PostCard({
  post,
  variant = "default",
  canLike,
}: PostCardProps) {
  const isFeatured = variant === "featured";
  const isHero = variant === "hero";
  const authorName = post.author?.name ?? post.author?.username ?? "Unknown";
  const hasMetrics =
    typeof post.views === "number" || typeof post.likes === "number";

  if (isHero) {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft-md transition-token hover:border-accent/40 hover:shadow-soft-lg">
                {post.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="block h-full w-full object-contain"
            />
            <span className="absolute left-3 top-3 rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur-sm">
              Featured
            </span>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag} tag={tag} asLink={false} />
            ))}
          </div>

          <h3 className="text-xl font-semibold leading-snug tracking-tight lg:text-2xl">
            <Link
              href={`/posts/${post.slug}`}
              className="transition-colors group-hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {post.title}
            </Link>
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-muted">
            <div className="flex min-w-0 items-center gap-2">
              {post.author ? (
                <>
                  <AuthorAvatar
                    image={post.author.image}
                    name={authorName}
                  />
                  <span className="truncate font-medium text-foreground/80">
                    {authorName}
                  </span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>·</span>
              <span className="whitespace-nowrap">{post.readingTime}</span>
            </div>

            {hasMetrics ? (
              <EngagementMeta
                slug={post.slug}
                views={post.views ?? 0}
                likes={post.likes ?? 0}
                likedByMe={post.likedByMe}
                canLike={canLike ?? post.canLike}
              />
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={
        isFeatured
          ? "group flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-accent/3 shadow-soft-md transition-token hover:-translate-y-0.5 hover:border-accent"
          : "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent hover:shadow-soft-md"
      }
    >
        {post.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="block h-full w-full object-contain"
          />
        </div>
      ) : null}

      <div
        className={
          isFeatured
            ? "flex flex-1 flex-col gap-4 p-6 md:p-8"
            : "flex flex-1 flex-col gap-3 p-4 sm:p-5"
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
              ? "text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
              : "text-base font-semibold tracking-tight sm:text-lg"
          }
        >
          <Link
            href={`/posts/${post.slug}`}
            className="transition-colors group-hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            {post.title}
          </Link>
        </h3>

        <p
          className={
            isFeatured
              ? "line-clamp-3 text-sm leading-relaxed text-muted sm:text-base"
              : "line-clamp-2 text-sm leading-relaxed text-muted"
          }
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-muted">
          <div className="flex min-w-0 items-center gap-2">
            {post.author ? (
              <>
                <AuthorAvatar
                  image={post.author.image}
                  name={authorName}
                  size={isFeatured ? "md" : "sm"}
                />
                <span className="truncate font-medium text-foreground/80">
                  {authorName}
                </span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <time dateTime={post.date}>{post.date}</time>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{post.readingTime}</span>
          </div>

          {hasMetrics ? (
            <EngagementMeta
              slug={post.slug}
              views={post.views ?? 0}
              likes={post.likes ?? 0}
              likedByMe={post.likedByMe}
              canLike={canLike ?? post.canLike}
              size={isFeatured ? "md" : "sm"}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}