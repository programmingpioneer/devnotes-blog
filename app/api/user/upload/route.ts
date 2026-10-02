import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  uploadImage,
  validateImage,
  type ImagePreset,
} from "@/lib/storage/r2";

// Node.js runtime — required for @aws-sdk/client-s3 and node:crypto.
export const runtime = "nodejs";

// ============================================================
// POST /api/user/upload
//   body: multipart/form-data { file: <image> }
//   → 201 { ok: true, key, url }
//   Auth: any logged-in user (not admin-only)
// ============================================================
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No file provided. Form field must be named 'file'." },
      { status: 400 }
    );
  }

  const check = validateImage(file);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  // Optional `preset` form field: "content" (default) | "cover".
  // Unknown values fall back to "content" — never trust the client.
  const presetField = formData.get("preset");
  const preset: ImagePreset =
    presetField === "cover" ? "cover" : "content";

  try {
    const result = await uploadImage(file, preset);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err) {
    console.error("[user/upload] R2 upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}