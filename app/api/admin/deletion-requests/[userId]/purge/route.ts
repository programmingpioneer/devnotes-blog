import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { permanentlyDeleteUser } from "@/lib/auth/deletion";

// ============================================================
// Zod schema
// ============================================================
const purgeSchema = z.object({
  bypass: z.boolean().optional().default(false),
});

type Params = { params: Promise<{ userId: string }> };

// ============================================================
// POST /api/admin/deletion-requests/:userId/purge
// body: { bypass?: boolean }
// ============================================================
export async function POST(request: Request, { params }: Params) {
  const session = await requireAdmin();
  const { userId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = purgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const result = await permanentlyDeleteUser(
    userId,
    session.user.id,
    parsed.data.bypass
  );

  if (result.status === "not_found") {
    return NextResponse.json(
      { error: "Request not found or still in grace period." },
      { status: 404 }
    );
  }

  if (result.status === "already_completed") {
    return NextResponse.json(
      { error: "Request already completed." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}