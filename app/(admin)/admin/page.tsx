import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import StatCard from "@/components/admin/StatCard";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function AdminPage() {
  const user = await getCurrentUser();

    const [
    totalPosts,
    publishedPosts,
    draftPosts,
    pendingPosts,
    totalUsers,
    recentPosts,
    recentUsers,
  ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.user.count(),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name ?? "Admin"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Overview of your blog content and users.
        </p>
      </div>

            {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total posts" value={totalPosts} href="/admin/posts" />
        <StatCard
          label="Published"
          value={publishedPosts}
          sublabel={
            totalPosts > 0
              ? `${Math.round((publishedPosts / totalPosts) * 100)}% of total`
              : undefined
          }
        />
        <StatCard label="Drafts" value={draftPosts} />
        <StatCard
          label="Pending review"
          value={pendingPosts}
          sublabel={pendingPosts > 0 ? "needs attention" : "all clear"}
          href="/admin/pending"
        />
        <StatCard label="Users" value={totalUsers} href="/admin/users" />
      </div>

      {/* Recent lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <section className="rounded-xl border border-border bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent posts</h3>
            <Link
              href="/admin/posts"
              className="text-xs font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted">No posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="group flex items-start justify-between gap-3 rounded-md p-2 -mx-2 transition-colors hover:bg-muted/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-accent">
                        {post.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(post.updatedAt)}
                      </p>
                    </div>
                    {post.status === "DRAFT" && (
                      <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        Draft
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent users */}
        <section className="rounded-xl border border-border bg-background p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent users</h3>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.name ?? u.username ?? "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-muted">{u.email}</p>
                  </div>
                  <span
                    className={
                      u.role === "ADMIN"
                        ? "shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                        : "shrink-0 text-xs text-muted"
                    }
                  >
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}