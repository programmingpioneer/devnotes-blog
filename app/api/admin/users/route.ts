import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";

// ============================================================
// GET /api/admin/users
// ============================================================
export async function GET() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    count: users.length,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
      postCount: u._count.posts,
    })),
  });
}