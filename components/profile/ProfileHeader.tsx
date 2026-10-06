import Link from "next/link";
import type { ProfileLink } from "@/lib/profile/schemas";
import SocialLinks from "@/components/profile/SocialLinks";

type ProfileHeaderProps = {
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  coverImage: string | null;
  links: ProfileLink[] | null;
  isOwner: boolean;
  role?: "USER" | "ADMIN" | null;
};

function initialsOf(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileHeader({
  name,
  username,
  email,
  image,
  bio,
  coverImage,
  links,
  isOwner,
  role,
}: ProfileHeaderProps) {
  const initials = initialsOf(name, email);

  return (
    <header className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Cover area — relative for avatar positioning */}
      <div className="relative h-40 w-full sm:h-52">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-accent/25 via-accent/10 to-transparent" />
        )}

        {/* Avatar — half inside cover, half outside */}
        <div className="absolute -bottom-14 left-5 z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted/10 text-2xl font-semibold text-muted shadow-lg sm:left-8 sm:h-28 sm:w-28 sm:text-3xl">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name ?? "Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      {/* Content — padded to clear the half-avatar sticking down */}
      <div className="px-5 pb-6 pt-16 sm:px-8 sm:pt-20">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {name ?? "User"}
              </h1>
              {role && (
                <span
                  className={
                    role === "ADMIN"
                      ? "shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent"
                      : "shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted"
                  }
                >
                  {role === "ADMIN" ? "Admin" : "Member"}
                </span>
              )}
            </div>
            {username && (
              <p className="mt-0.5 text-sm text-muted">@{username}</p>
            )}
          </div>

          {isOwner && (
            <Link
              href="/dashboard/edit-profile"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Edit profile
            </Link>
          )}
        </div>

        {bio && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-muted sm:text-base">
            {bio}
          </p>
        )}

        {links && links.length > 0 && (
          <div className="mt-4">
            <SocialLinks links={links} className="justify-start" />
          </div>
        )}
      </div>
    </header>
  );
}
