import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { generateUniquePostSlug } from "@/lib/content/slug";
import { canTransition } from "@/lib/content/post-status";
import { assertUploadedImageLimit } from "@/lib/content/count-uploaded-images";

const updateMemberPostSchema = z.object({
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
  date: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  regenerateSlug: z.boolean().optional(),
  status: z.enum(["PENDING_REVIEW"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

// ============================================================
// PATCH /api/posts/:id
//   Owner edits their own DRAFT or REJECTED post.
//   May also transition DRAFT/REJECTED -> PENDING_REVIEW (resubmit).
// ============================================================
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMemberPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      status: true,
      slug: true,
      coverImage: true,
      content: true,
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Cannot edit post in its current status" },
      { status: 409 }
    );
  }

  const {
    tags,
    regenerateSlug,
    coverImage,
    pillar,
    date,
    status: nextStatus,
    ...rest
  } = parsed.data;

  // Enforce the "max 3 uploaded images per post" rule (cover + inline).
  // For fields not present in the body, fall back to the stored value.
  const nextCover =
    coverImage !== undefined ? coverImage || null : existing.coverImage;
  const nextContent = rest.content !== undefined ? rest.content : existing.content;
  const limitError = assertUploadedImageLimit(nextCover, nextContent);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 422 });
  }

  if (nextStatus && !canTransition(existing.status, nextStatus, "MEMBER")) {
    return NextResponse.json(
      { error: `Cannot transition from ${existing.status} to ${nextStatus}` },
      { status: 409 }
    );
  }

  let newSlug: string | undefined;
  if (regenerateSlug && rest.title) {
    newSlug = await generateUniquePostSlug(rest.title, id);
  }

  const data: Record<string, unknown> = { ...rest };
  if (newSlug) data.slug = newSlug;
  if (coverImage !== undefined) data.coverImage = coverImage || null;
  if (pillar !== undefined) data.pillar = pillar || null;
  if (date !== undefined) data.date = new Date(date);

  if (nextStatus) {
    data.status = nextStatus;
    data.rejectionNote = null;
    data.reviewedAt = null;
    data.reviewedBy = null;
  } else if (existing.status === "REJECTED") {
    data.rejectionNote = null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (tags) {
      const normalized = Array.from(
        new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
      );

      await tx.postTag.deleteMany({ where: { postId: id } });

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
// DELETE /api/posts/:id
//   Owner deletes their own DRAFT post.
// ============================================================
export async function DELETE(_request: Request, { params }: Params) {
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
  if (existing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only draft posts can be deleted" },
      { status: 409 }
    );
  }

  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}