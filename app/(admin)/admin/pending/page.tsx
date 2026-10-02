import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import PendingCard, {
  type PendingCardData,
} from "@/components/admin/PendingCard";
import Pagination from "@/components/shared/Pagination";
import StatCard from "@/components/admin/StatCard";

const PAGE_SIZE = 10;

type SearchParams = { page?: string };

export default async function AdminPendingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const { page: pageParam } = await searchParams;
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, approvedToday, rejectedToday, posts] = await Promise.all([
    prisma.post.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.post.count({
      where: { status: "PUBLISHED", reviewedAt: { gte: startOfToday } },
    }),
    prisma.post.count({
      where: { status: "REJECTED", reviewedAt: { gte: startOfToday } },
    }),
    prisma.post.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" }, // oldest first — review queue
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        excerpt: true,
        coverImage: true,
        pillar: true,
        createdAt: true,
        author: { select: { name: true, username: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cards: PendingCardData[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    pillar: p.pillar,
    createdAt: p.createdAt,
    authorName: p.author?.name ?? p.author?.username ?? "Unknown",
    tags: p.tags.map((pt) => pt.tag.name),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={total}
          sublabel={total > 0 ? "needs attention" : "all clear"}
        />
        <StatCard
          label="Approved today"
          value={approvedToday}
          sublabel="published"
        />
        <StatCard
          label="Rejected today"
          value={rejectedToday}
          sublabel="sent back to authors"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pending review
        </h1>
        <p className="mt-1 text-sm text-muted">
          {total} {total === 1 ? "post" : "posts"} awaiting review · oldest
          first
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">
            Nothing pending. The queue is empty. 🎉
          </p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to posts
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <PendingCard key={c.id} post={c} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/pending"
          />
        </>
      )}
    </div>
  );
}