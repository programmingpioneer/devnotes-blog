import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatTile from "@/components/dashboard/StatTile";
import QuickAction from "@/components/dashboard/QuickAction";
import type { ProfileLink } from "@/lib/profile/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

function PostsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M14 4v6h6" />
      <path d="M8 14h8" />
      <path d="M8 18h5" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function PublishedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const dbUser = user?.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          email: true,
          image: true,
          bio: true,
          coverImage: true,
          links: true,
          username: true,
          createdAt: true,
        },
      })
    : null;

  const [total, drafts, published] = user?.id
    ? await Promise.all([
        prisma.post.count({ where: { authorId: user.id } }),
        prisma.post.count({
          where: { authorId: user.id, status: "DRAFT" },
        }),
        prisma.post.count({
          where: { authorId: user.id, status: "PUBLISHED" },
        }),
      ])
    : [0, 0, 0];

  const links = (dbUser?.links as ProfileLink[] | null) ?? null;

  const memberSince = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const publishRate = total > 0 ? Math.round((published / total) * 100) : 0;

  return (
    <div className="space-y-10">
      {dbUser && (
        <ProfileHeader
          name={dbUser.name}
          username={dbUser.username}
          email={dbUser.email}
          image={dbUser.image}
          bio={dbUser.bio}
          coverImage={dbUser.coverImage}
          links={links}
          isOwner={true}
          role={user?.role ?? null}
        />
      )}

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Your overview
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              A quick snapshot of your writing activity.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Posts"
            value={total}
            icon={<PostsIcon />}
            hint={total === 0 ? "No posts yet" : "All time"}
          />
          <StatTile
            label="Drafts"
            value={drafts}
            icon={<DraftIcon />}
            hint={drafts > 0 ? "Unpublished work" : "All caught up"}
          />
          <StatTile
            label="Published"
            value={published}
            icon={<PublishedIcon />}
            hint={`${publishRate}% of your posts`}
          />
        </div>
      </section>

      <section>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Shortcuts to the things you do most.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <QuickAction
            href="/dashboard/edit-profile"
            title="Edit profile"
            description="Update your name, bio, avatar, and links."
            icon={<UserIcon />}
          />
          <QuickAction
            href="/dashboard/settings"
            title="Security settings"
            description="Change password and account preferences."
            icon={<ShieldIcon />}
          />
          {dbUser?.username && (
            <QuickAction
              href={`/u/${dbUser.username}`}
              title="View public profile"
              description="See how your profile appears to readers."
              icon={<ExternalIcon />}
            />
          )}
          {user?.role === "ADMIN" && (
            <QuickAction
              href="/admin"
              title="Admin panel"
              description="Manage posts, users, and site content."
              icon={<AdminIcon />}
            />
          )}
        </div>
      </section>

      <section>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          <p className="mt-0.5 text-sm text-muted">
            Details tied to your account.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-background">
          <dl className="divide-y divide-border">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="truncate text-sm font-medium">
                {user?.email ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <dt className="text-sm text-muted">Username</dt>
              <dd className="text-sm font-medium">
                {dbUser?.username ? (
                  `@${dbUser.username}`
                ) : (
                  <Link
                    href="/dashboard/edit-profile"
                    className="text-accent hover:underline"
                  >
                    Set username
                  </Link>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <dt className="text-sm text-muted">Member since</dt>
              <dd className="text-sm font-medium">{memberSince}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}