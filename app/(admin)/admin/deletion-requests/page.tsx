import { requireAdmin } from "@/lib/auth/session";
import { listDeletionRequests } from "@/lib/auth/deletion";
import DeletionRequestTable, {
  type SerializedDeletionRequest,
} from "@/components/admin/DeletionRequestTable";
import StatCard from "@/components/admin/StatCard";
import Pagination from "@/components/shared/Pagination";

const PAGE_SIZE = 15;

type SearchParams = { page?: string };

export default async function AdminDeletionRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const requests = await listDeletionRequests();

  const serialized: SerializedDeletionRequest[] = requests.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    email: r.email,
    username: r.username,
    requestedAt: r.requestedAt.toISOString(),
    scheduledFor: r.scheduledFor.toISOString(),
    status: r.status,
    forceRequestedAt: r.forceRequestedAt
      ? r.forceRequestedAt.toISOString()
      : null,
    daysRemaining: r.daysRemaining,
    postCount: r.postCount,
  }));

  const total = serialized.length;
  const ready = serialized.filter((r) => r.daysRemaining === 0).length;
  const inGrace = serialized.filter((r) => r.daysRemaining > 0).length;
  const postsAffected = serialized.reduce((sum, r) => sum + r.postCount, 0);

  const { page: pageParam } = await searchParams;
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const paged = serialized.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Deletion requests
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage pending account deletion requests and their grace periods.
        </p>
        <p className="mt-1 text-xs text-muted">
          {total} {total === 1 ? "pending request" : "pending requests"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={total}
          sublabel={total === 1 ? "request" : "requests"}
        />
        <StatCard label="Ready" value={ready} sublabel="to delete" />
        <StatCard label="Grace period" value={inGrace} sublabel="active" />
        <StatCard label="Posts" value={postsAffected} sublabel="affected" />
      </div>

      <DeletionRequestTable requests={paged} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/deletion-requests"
      />
    </div>
  );
}