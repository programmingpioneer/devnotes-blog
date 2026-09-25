import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import UserTable from "@/components/admin/UserTable";
import StatCard from "@/components/admin/StatCard";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    postCount: u._count.posts,
  }));

  const totalUsers = rows.length;
  const adminCount = rows.filter((u) => u.role === "ADMIN").length;
  const regularCount = totalUsers - adminCount;
  const totalPosts = rows.reduce((sum, u) => sum + u.postCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted">
          Manage users, roles, and published content.
        </p>
        <p className="mt-1 text-xs text-muted">
          {totalUsers} {totalUsers === 1 ? "user" : "users"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={totalUsers}
          sublabel="registered"
        />
        <StatCard
          label="Admins"
          value={adminCount}
          sublabel={adminCount === 1 ? "administrator" : "administrators"}
        />
        <StatCard
          label="Regular users"
          value={regularCount}
          sublabel="standard accounts"
        />
        <StatCard
          label="Total posts"
          value={totalPosts}
          sublabel="published"
        />
      </div>

      <UserTable users={rows} currentUserId={session.user.id} />
    </div>
  );
}