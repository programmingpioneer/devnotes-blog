import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import {
  profileUpdateSchema,
  validateLinkUrl,
  type ProfileLink,
} from "@/lib/profile/schemas";

export async function PATCH(request: Request) {
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

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { name, username, bio, links, coverImage, image } = parsed.data;

  // Per-link URL validation
  const linkErrors: string[] = [];
  for (const link of links) {
    const err = validateLinkUrl(link.icon, link.url);
    if (err) linkErrors.push(`${link.icon}: ${err}`);
  }
  if (linkErrors.length > 0) {
    return NextResponse.json(
      { error: "Some links are invalid", issues: linkErrors },
      { status: 422 }
    );
  }

  // Username uniqueness (if changed)
  const trimmedUsername = username?.trim() || null;
  if (trimmedUsername) {
    const existing = await prisma.user.findUnique({
      where: { username: trimmedUsername },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      username: trimmedUsername,
      bio: bio?.trim() || null,
      links:
        links.length > 0
          ? (links as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
      coverImage: coverImage?.trim() || null,
      image: image?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      links: true,
      coverImage: true,
      image: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}