import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listDeletionRequests } from "@/lib/auth/deletion";

// ============================================================
// GET /api/admin/deletion-requests
// ============================================================
export async function GET() {
  await requireAdmin();

  const requests = await listDeletionRequests();

  return NextResponse.json({
    ok: true,
    count: requests.length,
    requests,
  });
}