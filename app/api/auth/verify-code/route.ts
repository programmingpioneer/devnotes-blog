import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { consumeVerificationCode } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import WelcomeEmailTemplate from "@/lib/email/templates/welcome";
import { siteConfig } from "@/content/config";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
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

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid code or email." },
      { status: 400 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const result = await consumeVerificationCode(email, code);

  switch (result.status) {
    case "invalid":
      return NextResponse.json(
        { error: "No active code. Please request a new one." },
        { status: 400 }
      );

    case "expired":
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 }
      );

    case "too_many_attempts":
      return NextResponse.json(
        { error: "Too many incorrect attempts. Request a new code." },
        { status: 429 }
      );

    case "mismatch":
      return NextResponse.json(
        {
          error: `Incorrect code. ${result.attemptsLeft} attempt${
            result.attemptsLeft === 1 ? "" : "s"
          } remaining.`,
        },
        { status: 400 }
      );

    case "ok":
      break;
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Send welcome email — non-blocking, failure shouldn't break verification
  try {
    const html = WelcomeEmailTemplate({ name: user.name, email });
    await sendEmail({
      to: email,
      toName: user.name ?? email,
      subject: `Welcome to ${siteConfig.title}`,
      html,
    });
  } catch (err) {
    console.error("[verify-code] Welcome email failed:", err);
  }

  return NextResponse.json({
    ok: true,
    message: "Email verified successfully.",
  });
}