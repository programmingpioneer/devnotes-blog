import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { consumeVerificationToken } from "@/lib/auth/tokens";

const querySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().min(10).max(200),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    email: url.searchParams.get("email") ?? "",
    token: url.searchParams.get("token") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid verification link" },
      { status: 400 }
    );
  }

  const { email, token } = parsed.data;

  const consumed = await consumeVerificationToken(email, token);
  if (!consumed) {
    return NextResponse.json(
      { error: "Invalid or expired verification link" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Email verified. You can now sign in.",
  });
}