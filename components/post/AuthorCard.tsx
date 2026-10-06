import Link from "next/link";
import type { PostAuthor } from "@/lib/content/posts";

const FALLBACK_BIO =
  "Full-stack engineer. Writing about production web systems, backend architecture, and lessons from shipping real software.";

function initialsOf(name: string | null, username: string | null): string {
  const source = (name ?? username ?? "?").trim();
  return (
    source
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function AuthorCard({ author }: { author: PostAuthor }) {
  const displayName = author.name ?? author.username ?? "Anonymous";
  const initials = initialsOf(author.name, author.username);
  const bio = author.bio?.trim() || FALLBACK_BIO;

  return (
    <aside className="mt-12 flex flex-col gap-4 rounded-xl border border-border p-6 md:flex-row md:items-center">
      <div
        aria-hidden
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-lg font-semibold text-accent"
      >
        {author.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-semibold">{displayName}</p>
          {author.username && (
            <p className="text-xs text-muted">@{author.username}</p>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">{bio}</p>
      </div>

      {author.username && (
        <Link
          href={`/u/${author.username}`}
          className="shrink-0 rounded-md border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          View profile
        </Link>
      )}
    </aside>
  );
}