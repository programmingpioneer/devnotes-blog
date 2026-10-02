import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { canTransition } from "@/lib/content/post-status";
import { sendEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/content/config";
import PostRejectedUserTemplate from "@/lib/email/templates/post-rejected-user";

const rejectSchema = z.object({
  note: z.string().trim().min(10).max(1000),
});

type Params = { params: Promise<{ id: string }> };

// ============================================================
// POST /api/admin/posts/:id/reject
//   Admin rejects a PENDING_REVIEW post with a note.
// ============================================================
export async function POST(request: Request, { params }: Params) {
  const session = await requireAdmin();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { note } = parsed.data;

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      slug: true,
      title: true,
      author: { select: { name: true, username: true, email: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (!canTransition(existing.status, "REJECTED", "ADMIN")) {
    return NextResponse.json(
      { error: "Post is not pending review" },
      { status: 409 }
    );
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionNote: note,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    },
    select: { id: true, slug: true, title: true, status: true, updatedAt: true },
  });

  const authorEmail = existing.author?.email;
  if (authorEmail) {
    const authorName =
      existing.author.name ?? existing.author.username ?? authorEmail;
    const html = PostRejectedUserTemplate({
      authorName,
      postTitle: existing.title,
      rejectionNote: note,
      editUrl: `${siteConfig.url}/dashboard/posts/${id}`,
    });
    void sendEmail({
      to: authorEmail,
      toName: existing.author.name ?? existing.author.username ?? undefined,
      subject: `Update on your submission: "${existing.title}"`,
      html,
    }).catch((err) => {
      console.error("[api/admin/posts/reject] email failed:", err);
    });
  } else {
    console.warn(
      "[api/admin/posts/reject] author email missing; skipping notification"
    );
  }

  return NextResponse.json({ ok: true, post: updated });
}