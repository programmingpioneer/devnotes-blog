import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";

// 24-hour idempotency window for view deduplication.
const VIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

// Best-effort per-IP rate limit. In-memory only — resets on restart and
// does not coordinate across instances. Acceptable for single-instance
// deployments; replace with Redis when scaling horizontally.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateMap = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (rateMap.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateMap.set(ip, recent);
  return false;
}

// Accepts either a post cuid (lowercase alphanumeric) or a URL slug
// (lowercase alphanumeric with single hyphens). Broader case coverage
// allows cuids/uuids as well.
const IDENTIFIER_RE = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

type Params = { params: Promise<{ id: string }> };

// ============================================================
// POST /api/posts/:id/view
//   Record a view on a published post. Accepts either the post's
//   cuid or its slug as :id. Idempotent per identity (logged-in
//   userId OR logged-out IP hash) for 24 hours.
//   → 200 { views: number }
// ============================================================
export async function POST(request: Request, { params }: Params) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  if (!IDENTIFIER_RE.test(id)) {
    return NextResponse.json(
      { error: "Invalid identifier" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: "PUBLISHED",
    },
    select: { id: true, views: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const secret = process.env.VIEW_HASH_SECRET;
  if (!secret) {
    console.error("[api/posts/view] VIEW_HASH_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const ipHash = createHash("sha256")
    .update(`${ip}:${secret}`)
    .digest("hex");

  const windowStart = new Date(Date.now() - VIEW_WINDOW_MS);

  // 24h idempotency check — same identity + same post = no new view.
  const existing = await prisma.postView.findFirst({
    where: {
      postId: post.id,
      createdAt: { gte: windowStart },
      ...(userId ? { userId } : { userId: null, ipHash }),
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ views: post.views });
  }

  const [, updated] = await prisma.$transaction([
    prisma.postView.create({
      data: { postId: post.id, userId, ipHash },
    }),
    prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    }),
  ]);

  return NextResponse.json({ views: updated.views });
}