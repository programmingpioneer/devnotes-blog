import { requireAdmin } from "@/lib/auth/session";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Control panel
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}