import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import UserTable from "@/components/admin/UserTable";
import StatCard from "@/components/admin/StatCard";
import Pagination from "@/components/shared/Pagination";

const PAGE_SIZE = 15;

type SearchParams = { page?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdmin();

  const { page: pageParam } = await searchParams;
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [total, users, adminCount, postsAgg] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.post.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    postCount: u._count.posts,
  }));

  const regularCount = total - adminCount;
  const totalPosts = postsAgg;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted">
          Manage users, roles, and published content.
        </p>
        <p className="mt-1 text-xs text-muted">
          {total} {total === 1 ? "user" : "users"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={total} sublabel="registered" />
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
        <StatCard label="Total posts" value={totalPosts} sublabel="all time" />
      </div>

      <UserTable users={rows} currentUserId={session.user.id} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/users"
      />
    </div>
  );
}