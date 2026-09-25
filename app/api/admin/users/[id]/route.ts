import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";

// ============================================================
// Zod schema
// ============================================================
const patchUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

type Params = { params: Promise<{ id: string }> };

// ============================================================
// PATCH /api/admin/users/:id  —  body: { role }
// ============================================================
export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdmin();
  const { id } = await params;

  // Self-role-change guard: prevents accidental self-demotion / lockout
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { role } = parsed.data;

  // Transaction: read target + count admins + update atomically.
  // Prevents two concurrent demotes from both passing the "last admin" check.
  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) return { kind: "not_found" as const };

    // Demotion path (ADMIN → USER) must leave at least one admin standing
    if (target.role === "ADMIN" && role === "USER") {
      const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { kind: "last_admin" as const };
    }

    const updated = await tx.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });
    return { kind: "ok" as const, user: updated };
  });

  if (result.kind === "not_found") {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (result.kind === "last_admin") {
    return NextResponse.json(
      { error: "Cannot demote the last admin" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, user: result.user });
}

// ============================================================
// DELETE /api/admin/users/:id
// ============================================================
export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireAdmin();
  const { id } = await params;

  // Self-delete guard
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete yourself" },
      { status: 400 }
    );
  }

  // Transaction: check existence + post count + delete atomically.
  // Post.authorId has no explicit onDelete in schema → Prisma default = Restrict.
  // API check gives friendly message; DB FK is the hard safety net.
  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id },
      select: { id: true, _count: { select: { posts: true } } },
    });
    if (!target) return { kind: "not_found" as const };
    if (target._count.posts > 0) return { kind: "has_posts" as const };

    await tx.user.delete({ where: { id } });
    return { kind: "ok" as const };
  });

  if (result.kind === "not_found") {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (result.kind === "has_posts") {
    return NextResponse.json(
      { error: "User has posts. Reassign or delete their posts first." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}