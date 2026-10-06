import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";

// Best-effort per-user rate limit. In-memory — resets on restart and does
// not coordinate across instances. Replace with Redis when scaling.
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (rateMap.get(userId) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateMap.set(userId, recent);
    return true;
  }
  recent.push(now);
  rateMap.set(userId, recent);
  return false;
}

// Accepts either a post cuid (lowercase alphanumeric) or a URL slug
// (lowercase alphanumeric with single hyphens). Broader case coverage
// allows cuids/uuids as well.
const IDENTIFIER_RE = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

type Params = { params: Promise<{ id: string }> };

type ResolvedPost =
  | { ok: true; postId: string }
  | { ok: false; response: NextResponse };

async function resolvePost(identifier: string): Promise<ResolvedPost> {
  if (!IDENTIFIER_RE.test(identifier)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid identifier" },
        { status: 400 }
      ),
    };
  }
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      status: "PUBLISHED",
    },
    select: { id: true },
  });
  if (!post) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  return { ok: true, postId: post.id };
}

async function likeCounts(postId: string, userId: string) {
  const [likes, mine] = await Promise.all([
    prisma.postLike.count({ where: { postId } }),
    prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    }),
  ]);
  return { likes, likedByMe: mine !== null };
}

// ============================================================
// POST /api/posts/:id/like
//   Like a published post (idempotent — repeated calls are no-ops).
//   → 200 { likes: number, likedByMe: boolean }
//   → 401 if not authenticated
// ============================================================
export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isRateLimited(userId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const resolved = await resolvePost(id);
  if (!resolved.ok) return resolved.response;

  try {
    await prisma.postLike.create({
      data: { postId: resolved.postId, userId },
    });
  } catch (err) {
    // P2002 = unique constraint violation → user already liked this post.
    // Treat as idempotent success, not an error.
    if (
      !(err instanceof Prisma.PrismaClientKnownRequestError) ||
      err.code !== "P2002"
    ) {
      throw err;
    }
  }

  const counts = await likeCounts(resolved.postId, userId);
  return NextResponse.json(counts);
}

// ============================================================
// DELETE /api/posts/:id/like
//   Unlike a published post (idempotent — no-op if not liked).
//   → 200 { likes: number, likedByMe: boolean }
//   → 401 if not authenticated
// ============================================================
export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isRateLimited(userId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const resolved = await resolvePost(id);
  if (!resolved.ok) return resolved.response;

  await prisma.postLike.deleteMany({
    where: { postId: resolved.postId, userId },
  });

  const counts = await likeCounts(resolved.postId, userId);
  return NextResponse.json(counts);
}