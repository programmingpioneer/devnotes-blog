// Guards the "max N uploaded images per post" business rule.
//
// "Uploaded" = URL whose host matches R2_PUBLIC_URL and whose path begins
// with /uploads/. Any other URL (external CDN, imgur, etc.) is NOT counted.
//
// Counting is by UNIQUE URL: embedding the same image twice counts once.
// Both markdown ![alt](url) and raw HTML <img src="url"> are recognized.

export const MAX_UPLOADED_IMAGES = 3;

let warnedMissingBase = false;

function getUploadPrefix(): string | null {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    if (!warnedMissingBase) {
      console.warn(
        "[upload-limit] R2_PUBLIC_URL not set — uploaded-image limit disabled."
      );
      warnedMissingBase = true;
    }
    return null;
  }
  return base.replace(/\/+$/, "") + "/uploads/";
}

/**
 * Shared prefix matcher. Counts UNIQUE URLs matching the given prefix.
 */
function countByPrefix(
  prefix: string,
  coverImage: string | null,
  content: string
): number {
  const urls = new Set<string>();

  if (coverImage && coverImage.startsWith(prefix)) {
    urls.add(coverImage);
  }

  // Markdown: ![alt](url)
  const mdRe = /!\[[^\]]*\]\(([^)\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(content)) !== null) {
    if (m[1].startsWith(prefix)) urls.add(m[1]);
  }

  // Raw HTML: <img ... src="url" ...>
  const htmlRe = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
  while ((m = htmlRe.exec(content)) !== null) {
    if (m[1].startsWith(prefix)) urls.add(m[1]);
  }

  return urls.size;
}

/**
 * Server-side count. Uses the private R2_PUBLIC_URL env var.
 * Returns 0 when R2_PUBLIC_URL is not configured.
 */
export function countUploadedImages(
  coverImage: string | null,
  content: string
): number {
  const prefix = getUploadPrefix();
  if (!prefix) return 0;
  return countByPrefix(prefix, coverImage, content);
}

/**
 * Client-safe count. Uses NEXT_PUBLIC_R2_PUBLIC_URL (browser-visible).
 * Returns 0 when the env var is missing — callers should treat 0 as
 * "guard disabled" and rely on the server-side check for enforcement.
 */
export function countUploadedImagesClient(
  coverImage: string | null,
  content: string
): number {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) return 0;
  const prefix = base.replace(/\/+$/, "") + "/uploads/";
  return countByPrefix(prefix, coverImage, content);
}

/**
 * Returns an error message if the post exceeds the uploaded-image limit,
 * or null when the post is within limit (or the check is disabled).
 *
 * Server-side enforcement only — the client may also disable the uploader
 * at the limit, but the server is the source of truth.
 */
export function assertUploadedImageLimit(
  coverImage: string | null,
  content: string
): string | null {
  const prefix = getUploadPrefix();
  if (!prefix) return null;

  const count = countUploadedImages(coverImage, content);
  if (count > MAX_UPLOADED_IMAGES) {
    return `Maximum ${MAX_UPLOADED_IMAGES} uploaded images per post (cover + inline combined). Found ${count}.`;
  }
  return null;
}