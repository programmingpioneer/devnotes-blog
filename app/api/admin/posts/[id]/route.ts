import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { generateUniquePostSlug } from "@/lib/content/slug";

// ============================================================
// Shared schema (all fields optional for PATCH)
// ============================================================
const updatePostSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  excerpt: z.string().trim().min(1).max(500).optional(),
  content: z.string().min(1).max(100_000).optional(),
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
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  regenerateSlug: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// ============================================================
// GET /api/admin/posts/:id
// ============================================================
export async function GET(_request: Request, { params }: Params) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      status: true,
      pillar: true,
      date: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, username: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    post: { ...post, tags: post.tags.map((pt) => pt.tag.name) },
  });
}

// ============================================================
// PATCH /api/admin/posts/:id
// ============================================================
export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Ensure post exists
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { tags, regenerateSlug, coverImage, pillar, date, ...rest } = parsed.data;

  // Slug regeneration: if title changed and requested, or slug is same as old slugified title
  let newSlug: string | undefined;
  if (regenerateSlug && rest.title) {
    newSlug = await generateUniquePostSlug(rest.title, id);
  }

  const data: Record<string, unknown> = { ...rest };
  if (newSlug) data.slug = newSlug;
  if (coverImage !== undefined) data.coverImage = coverImage || null;
  if (pillar !== undefined) data.pillar = pillar || null;
  if (date !== undefined) data.date = new Date(date);

  // Handle tags replacement in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    if (tags) {
      const normalized = Array.from(
        new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
      );

      // Delete existing PostTag rows
      await tx.postTag.deleteMany({ where: { postId: id } });

      // Upsert tags and re-attach
      const tagRecords = await Promise.all(
        normalized.map((name) =>
          tx.tag.upsert({ where: { name }, create: { name }, update: {} })
        )
      );

      data.tags = {
        create: tagRecords.map((t) => ({ tagId: t.id })),
      };
    }

    return tx.post.update({
      where: { id },
      data,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
  });

  return NextResponse.json({ ok: true, post: updated });
}

// ============================================================
// DELETE /api/admin/posts/:id
// ============================================================
export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}