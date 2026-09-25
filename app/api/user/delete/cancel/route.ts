import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { cancelDeletionRequest } from "@/lib/auth/deletion";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cancelled = await cancelDeletionRequest(session.user.id);

  if (!cancelled) {
    return NextResponse.json(
      { error: "No active deletion request to cancel." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}