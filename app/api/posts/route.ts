import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { generateUniquePostSlug } from "@/lib/content/slug";
import { assertUploadedImageLimit } from "@/lib/content/count-uploaded-images";
import { sendEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/content/config";
import PendingAlertAdminTemplate from "@/lib/email/templates/pending-alert-admin";

const PENDING_ALERT_THRESHOLD = 5;

const createPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  content: z.string().min(1).max(100_000),
  coverImage: z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("")),
  pillar: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .or(z.literal("")),
  date: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
  // Members may only save as DRAFT or submit for review. PUBLISHED is
  // admin-only and REJECTED is set exclusively by the admin reject route.
  status: z.enum(["DRAFT", "PENDING_REVIEW"]).default("DRAFT"),
});

// ============================================================
// POST /api/posts
//   Member submits a post for review.
//   → 201 { ok: true, post }
// ============================================================
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { title, excerpt, content, coverImage, pillar, date, tags, status } =
    parsed.data;

  // Enforce the "max 3 uploaded images per post" rule (cover + inline).
  const limitError = assertUploadedImageLimit(coverImage || null, content);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 422 });
  }

  const slug = await generateUniquePostSlug(title);

  const created = await prisma.$transaction(async (tx) => {
    const normalized = Array.from(
      new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
    );

    const tagRecords = await Promise.all(
      normalized.map((name) =>
        tx.tag.upsert({ where: { name }, create: { name }, update: {} })
      )
    );

    return tx.post.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        coverImage: coverImage || null,
        pillar: pillar || null,
        status,
        date: date ? new Date(date) : new Date(),
        authorId: session.user.id,
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
  });

    // Fire-and-forget queue alert — never blocks the response.
  // Only fires when the pending count lands exactly on a multiple of
  // the threshold (5, 10, 15, ...). No per-post email — the admin inbox
  // would be flooded on every submission.
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (adminEmail) {
    void (async () => {
      try {
        const pendingCount = await prisma.post.count({
          where: { status: "PENDING_REVIEW" },
        });

        if (
          pendingCount > 0 &&
          pendingCount % PENDING_ALERT_THRESHOLD === 0
        ) {
          const queueUrl = `${siteConfig.url}/admin/pending`;

          const topPosts = await prisma.post.findMany({
            where: { status: "PENDING_REVIEW" },
            orderBy: { createdAt: "asc" },
            take: 5,
            select: {
              id: true,
              title: true,
              author: { select: { name: true, username: true } },
            },
          });

          const alertHtml = PendingAlertAdminTemplate({
            pendingCount,
            topPosts: topPosts.map((p) => ({
              id: p.id,
              title: p.title,
              authorName: p.author.name ?? p.author.username ?? "Unknown",
            })),
            queueUrl,
          });
          await sendEmail({
            to: adminEmail,
            subject: `Pending review queue has reached ${pendingCount} posts`,
            html: alertHtml,
          });
        }
      } catch (err) {
        console.error("[api/posts] queue alert failed:", err);
      }
    })();
  } else {
    console.warn(
      "[api/posts] ADMIN_ALERT_EMAIL not set; skipping queue alert"
    );
  }

  return NextResponse.json({ ok: true, post: created }, { status: 201 });
}

// ============================================================
// GET /api/posts
//   List current user's own posts.
// ============================================================
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      status: true,
      pillar: true,
      date: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  return NextResponse.json({
    ok: true,
    count: posts.length,
    posts: posts.map((p) => ({
      ...p,
      tags: p.tags.map((pt) => pt.tag.name),
    })),
  });
}