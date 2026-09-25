import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { uploadImage, validateImage } from "@/lib/storage/r2";

// Node.js runtime — required for @aws-sdk/client-s3 and node:crypto.
// Edge runtime would fail at import time.
export const runtime = "nodejs";

// ============================================================
// POST /api/admin/upload
//   body: multipart/form-data { file: <image> }
//   → 201 { ok: true, key, url }
// ============================================================
export async function POST(request: Request) {
  await requireAdmin();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data body" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  // FormDataEntryValue is File | string; narrow to File only.
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No file provided. Form field must be named 'file'." },
      { status: 400 }
    );
  }

  // Friendly validation before touching R2
  const check = validateImage(file);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const result = await uploadImage(file);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err) {
    // Log server-side for debugging; do not leak details to client
    console.error("[upload] R2 upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}