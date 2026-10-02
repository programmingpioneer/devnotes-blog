import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { verifyDeletionCode } from "@/lib/auth/deletion";
import { sendEmail } from "@/lib/email/brevo";
import DeletionScheduledTemplate from "@/lib/email/templates/deletion-scheduled";
import DeletionAdminTemplate from "@/lib/email/templates/deletion-admin";
import { siteConfig } from "@/content/config";

const schema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
  force: z.boolean().optional(),
});

export async function POST(request: Request) {
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      username: true,
      _count: { select: { posts: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

    const result = await verifyDeletionCode(
    session.user.id,
    parsed.data.code,
    parsed.data.force === true
  );

  if (result.status === "not_found") {
    return NextResponse.json(
      { error: "No active deletion request." },
      { status: 404 }
    );
  }
  if (result.status === "expired") {
    return NextResponse.json(
      { error: "Code has expired. Request a new one." },
      { status: 410 }
    );
  }
  if (result.status === "too_many_attempts") {
    return NextResponse.json(
      { error: "Too many attempts. Request a new code." },
      { status: 429 }
    );
  }
  if (result.status === "mismatch") {
    return NextResponse.json(
      {
        error: "Incorrect code.",
        attemptsLeft: result.attemptsLeft,
      },
      { status: 422 }
    );
  }

  // Success — fetch updated request for scheduledFor
  const req = await prisma.accountDeletionRequest.findUnique({
    where: { userId: session.user.id },
    select: { scheduledFor: true, requestedAt: true },
  });

  if (!req) {
    return NextResponse.json(
      { error: "Request state lost. Try again." },
      { status: 500 }
    );
  }

  // User confirmation email
  const userHtml = DeletionScheduledTemplate({
    name: user.name,
    email: user.email,
    scheduledFor: req.scheduledFor,
    postCount: user._count.posts,
  });

  try {
    await sendEmail({
      to: user.email,
      toName: user.name ?? user.email,
      subject: `Account scheduled for deletion — ${siteConfig.title}`,
      html: userHtml,
    });
  } catch (err) {
    console.error("[delete/verify] User email failed:", err);
  }

  // Admin notification email
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const adminHtml = DeletionAdminTemplate({
      userName: user.name,
      userEmail: user.email,
      username: user.username,
      userId: session.user.id,
      requestedAt: req.requestedAt,
      scheduledFor: req.scheduledFor,
      postCount: user._count.posts,
    });

    try {
      await sendEmail({
        to: adminEmail,
        toName: "Admin",
        subject: `[Admin] Deletion request — ${user.email}`,
        html: adminHtml,
      });
    } catch (err) {
      console.error("[delete/verify] Admin email failed:", err);
    }
  } else {
    console.warn("[delete/verify] ADMIN_EMAIL not set — admin not notified.");
  }

  return NextResponse.json({
    ok: true,
    scheduledFor: req.scheduledFor.toISOString(),
  });
}