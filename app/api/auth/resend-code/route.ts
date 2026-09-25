import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { createVerificationCode } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import VerifyEmailTemplate from "@/lib/email/templates/verify";
import { siteConfig } from "@/content/config";

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Don't leak — same response whether email exists or not
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  // Cooldown check — look at existing token's createdAt
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existing) {
    const elapsed = Date.now() - existing.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec}s before requesting another code.` },
        { status: 429 }
      );
    }
  }

  const code = await createVerificationCode(email);
  const html = VerifyEmailTemplate({
    name: user.name,
    email,
    code,
  });

  try {
    await sendEmail({
      to: email,
      toName: user.name ?? email,
      subject: `Your verification code — ${siteConfig.title}`,
      html,
    });
  } catch (err) {
    console.error("[resend-code] Email failed:", err);
    return NextResponse.json(
      { error: "Could not send email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "New code sent.",
  });
}