import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { generateUniquePostSlug } from "@/lib/content/slug";

// ============================================================
// Zod schemas
// ============================================================
const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  excerpt: z.string().trim().min(1, "Excerpt required").max(500),
  content: z.string().min(1, "Content required").max(100_000),
  coverImage: z
    .string()
    .trim()
    .url("Cover must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  pillar: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  date: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
});

// ============================================================
// GET /api/admin/posts?status=DRAFT
// ============================================================
export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam === "DRAFT" || statusParam === "PUBLISHED" ? statusParam : undefined;

  const posts = await prisma.post.findMany({
    where: status ? { status } : undefined,
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
      updatedAt: true,
      author: { select: { id: true, name: true, username: true } },
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

// ============================================================
// POST /api/admin/posts
// ============================================================
export async function POST(request: Request) {
  const session = await requireAdmin();

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

  const { title, excerpt, content, coverImage, pillar, status, date, tags } =
    parsed.data;

  // Generate unique slug from title
  const slug = await generateUniquePostSlug(title);

  // Normalize tags: trim, lowercase, dedupe
  const normalizedTags = Array.from(
    new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
  );

  // Create post + upsert tags + join rows in a transaction
  const post = await prisma.$transaction(async (tx) => {
    // Upsert all tags (create if new)
    const tagRecords = await Promise.all(
      normalizedTags.map((name) =>
        tx.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
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
        tags: {
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
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

  return NextResponse.json({ ok: true, post }, { status: 201 });
}