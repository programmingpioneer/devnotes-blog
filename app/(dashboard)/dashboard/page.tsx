import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import type { ProfileLink } from "@/lib/profile/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

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

  return (
    <div>
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

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Your overview
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Posts
            </p>
            <p className="mt-1 text-2xl font-semibold">{total}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Drafts
            </p>
            <p className="mt-1 text-2xl font-semibold">{drafts}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Published
            </p>
            <p className="mt-1 text-2xl font-semibold">{published}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Quick actions
        </h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link
              href="/dashboard/edit-profile"
              className="text-sm font-medium text-accent hover:underline"
            >
              -&gt; Edit profile
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium text-accent hover:underline"
            >
              -&gt; Security settings
            </Link>
          </li>
          {dbUser?.username && (
            <li>
              <Link
                href={`/u/${dbUser.username}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                -&gt; View public profile
              </Link>
            </li>
          )}
          {user?.role === "ADMIN" && (
            <li>
              <Link
                href="/admin"
                className="text-sm font-medium text-accent hover:underline"
              >
                -&gt; Admin panel
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Account</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between border-b border-border py-3 text-sm">
            <span className="text-muted">Email</span>
            <span className="truncate">{user?.email ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3 text-sm">
            <span className="text-muted">Username</span>
            <span>{dbUser?.username ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3 text-sm">
            <span className="text-muted">Member since</span>
            <span>
              {dbUser?.createdAt
                ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}