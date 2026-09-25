import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { createPasswordResetToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import ResetPasswordTemplate from "@/lib/email/templates/reset";
import { siteConfig } from "@/content/config";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }

  const { email } = parsed.data;

  // Generic response — email enumeration prevention
  const genericMessage =
    "If that email is registered, we sent a password reset link.";

  const user = await prisma.user.findUnique({ where: { email } });

  // Silently succeed even if user not found (don't reveal existence)
  if (!user) {
    return NextResponse.json({ ok: true, message: genericMessage });
  }

  // OAuth-only user — no password to reset
  if (!user.passwordHash) {
    return NextResponse.json({
      ok: true,
      message:
        "This account uses Google Sign-In. Use Google to sign in instead.",
    });
  }

  const token = await createPasswordResetToken(user.id);
  const resetUrl = `${siteConfig.url}/reset-password?token=${token}`;
  const html = ResetPasswordTemplate({ name: user.name, email, resetUrl });

  try {
    await sendEmail({
      to: email,
      toName: user.name ?? email,
      subject: `Reset your password — ${siteConfig.title}`,
      html,
    });
  } catch (err) {
    console.error("[forgot-password] Email failed:", err);
  }

  return NextResponse.json({ ok: true, message: genericMessage });
}