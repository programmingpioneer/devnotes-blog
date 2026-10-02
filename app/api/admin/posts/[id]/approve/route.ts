import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { canTransition } from "@/lib/content/post-status";
import { sendEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/content/config";
import PostApprovedUserTemplate from "@/lib/email/templates/post-approved-user";

type Params = { params: Promise<{ id: string }> };

// ============================================================
// POST /api/admin/posts/:id/approve
//   Admin publishes a PENDING_REVIEW post.
// ============================================================
export async function POST(_request: Request, { params }: Params) {
  const session = await requireAdmin();
  const { id } = await params;

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      slug: true,
      title: true,
      excerpt: true,
      author: { select: { name: true, username: true, email: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
    if (!canTransition(existing.status, "PUBLISHED", "ADMIN")) {
    return NextResponse.json(
      { error: "Post is not pending review" },
      { status: 409 }
    );
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      rejectionNote: null,
    },
    select: { id: true, slug: true, title: true, status: true, updatedAt: true },
  });

  const authorEmail = existing.author?.email;
  if (authorEmail) {
    const authorName =
      existing.author.name ?? existing.author.username ?? authorEmail;
    const html = PostApprovedUserTemplate({
      authorName,
      postTitle: existing.title,
      postExcerpt: existing.excerpt,
      postUrl: `${siteConfig.url}/posts/${existing.slug}`,
    });
    void sendEmail({
      to: authorEmail,
      toName: existing.author.name ?? existing.author.username ?? undefined,
      subject: `Your post is now live: "${existing.title}"`,
      html,
    }).catch((err) => {
      console.error("[api/admin/posts/approve] email failed:", err);
    });
  } else {
    console.warn(
      "[api/admin/posts/approve] author email missing; skipping notification"
    );
  }

  return NextResponse.json({ ok: true, post: updated });
}