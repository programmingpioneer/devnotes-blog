import { requireAuth } from "@/lib/auth/session";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Your dashboard
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <DashboardNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}