import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/auth";

const querySchema = z.object({
  u: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Too short")
    .max(30, "Too long")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "Invalid format"
    ),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("u") ?? "";

  const parsed = querySchema.safeParse({ u: raw });
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Invalid username",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.u },
    select: { id: true },
  });

  // Agar same user ka apna username hai → available
  const isOwnUsername = existing?.id === session.user.id;

  return NextResponse.json({
    available: !existing || isOwnUsername,
    reason: existing && !isOwnUsername ? "Username is taken" : null,
  });
}