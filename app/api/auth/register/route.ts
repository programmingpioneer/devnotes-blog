import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import { createVerificationCode } from "@/lib/auth/tokens";
import { generateUniqueUsername } from "@/lib/auth/username";
import { sendEmail } from "@/lib/email/brevo";
import VerifyEmailTemplate from "@/lib/email/templates/verify";
import { siteConfig } from "@/content/config";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  // Already registered AND verified → 409
  if (existing && existing.emailVerified) {
    return NextResponse.json(
      { error: "Email already registered. Try signing in." },
      { status: 409 }
    );
  }

  // ============================================================
  // RESEND PATH: existing but NOT verified
  // ============================================================
  if (existing && !existing.emailVerified) {
    const code = await createVerificationCode(email);
    const html = VerifyEmailTemplate({
      name: existing.name,
      email,
      code,
    });

    try {
      await sendEmail({
        to: email,
        toName: existing.name ?? email,
        subject: `Your verification code — ${siteConfig.title}`,
        html,
      });
    } catch (err) {
      console.error("[register] Resend verification failed:", err);
    }

    return NextResponse.json(
      {
        ok: true,
        resent: true,
        message:
          "Account exists but not verified. We sent a new verification code.",
        email,
      },
      { status: 200 }
    );
  }

  // ============================================================
  // NEW USER PATH
  // ============================================================
  const passwordHash = await hashPassword(password);
  const username = await generateUniqueUsername(name, email);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      role: "USER",
      emailVerified: null,
    },
  });

  const code = await createVerificationCode(email);
  const html = VerifyEmailTemplate({ name, email, code });

  try {
    await sendEmail({
      to: email,
      toName: name,
      subject: `Your verification code — ${siteConfig.title}`,
      html,
    });
  } catch (err) {
    console.error("[register] Verification email failed:", err);
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Check your inbox for the 6-digit code.",
      email,
      userId: user.id,
    },
    { status: 201 }
  );
}