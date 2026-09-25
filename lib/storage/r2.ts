import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

// ============================================================
// Constants
// ============================================================
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const KEY_PREFIX = "uploads/";

// ============================================================
// Lazy singleton client
// ------------------------------------------------------------
// Instantiated on first use so missing env vars only fail at
// runtime (upload call), not at import time. This keeps
// `tsc --noEmit` and admin page rendering safe even if R2
// credentials are not yet configured.
// ============================================================
let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env"
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME not set in .env");
  return bucket;
}

function getPublicBase(): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL not set in .env");
  return base.replace(/\/+$/, ""); // strip trailing slashes
}

// ============================================================
// Public API
// ============================================================
export type UploadResult = {
  key: string;
  url: string;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validates an image file against MIME whitelist and 5MB size cap.
 * Call this BEFORE uploading so the API can return a friendly 400.
 */
export function validateImage(file: File): ValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: `Unsupported file type: ${file.type || "unknown"}. Allowed: PNG, JPEG, WebP, AVIF.`,
    };
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `File too large (${mb} MB). Max allowed: 5 MB.`,
    };
  }
  return { ok: true };
}

/**
 * Uploads an image to R2 under `uploads/<uuid>.<ext>`.
 * Returns the storage key and the public URL.
 *
 * Throws on validation failure OR R2 error — caller (API route)
 * must catch and translate to HTTP responses.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const check = validateImage(file);
  if (!check.ok) throw new Error(check.error);

  const ext = EXT_BY_MIME[file.type];
  const key = `${KEY_PREFIX}${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return {
    key,
    url: `${getPublicBase()}/${key}`,
  };
}

/**
 * Deletes an object from R2.
 * Guarded: only keys under `uploads/` are deletable, to prevent
 * accidental bucket-wide deletes if this is ever called with
 * user-supplied input.
 */
export async function deleteImage(key: string): Promise<void> {
  if (!key.startsWith(KEY_PREFIX)) {
    throw new Error(`Invalid key: only "${KEY_PREFIX}" prefix is deletable.`);
  }
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}