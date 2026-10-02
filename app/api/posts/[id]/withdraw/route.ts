import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { canTransition } from "@/lib/content/post-status";

type Params = { params: Promise<{ id: string }> };

// ============================================================
// POST /api/posts/:id/withdraw
//   Owner moves their PENDING_REVIEW post back to DRAFT.
// ============================================================
export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!canTransition(existing.status, "DRAFT", "MEMBER")) {
    return NextResponse.json(
      { error: "Only pending posts can be withdrawn" },
      { status: 409 }
    );
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { status: "DRAFT" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, post: updated });
}