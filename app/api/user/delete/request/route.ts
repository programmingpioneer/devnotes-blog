import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { createDeletionRequest } from "@/lib/auth/deletion";
import { sendEmail } from "@/lib/email/brevo";
import DeletionCodeTemplate from "@/lib/email/templates/deletion-code";
import { siteConfig } from "@/content/config";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await createDeletionRequest(session.user.id);

  if (result.status === "is_last_admin") {
    return NextResponse.json(
      {
        error:
          "You are the only admin. Promote another user to admin before deleting your account.",
      },
      { status: 409 }
    );
  }

  if (result.status !== "ok") {
    return NextResponse.json(
      { error: "Unable to create deletion request." },
      { status: 500 }
    );
  }

  const html = DeletionCodeTemplate({
    name: user.name,
    email: user.email,
    code: result.code,
  });

  try {
    await sendEmail({
      to: user.email,
      toName: user.name ?? user.email,
      subject: `Confirm account deletion — ${siteConfig.title}`,
      html,
    });
  } catch (err) {
    console.error("[delete/request] Email failed:", err);
    return NextResponse.json(
      { error: "Could not send verification email. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Check your inbox for the 6-digit code.",
  });
}