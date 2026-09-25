import { prisma } from "@/lib/db/client";

const MAX_USERNAME_LENGTH = 30;
const MAX_ATTEMPTS = 100;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (é → e)
    .replace(/[^a-z0-9]+/g, "-")     // non-alphanumeric → hyphens
    .replace(/^-+|-+$/g, "")         // trim leading/trailing hyphens
    .slice(0, MAX_USERNAME_LENGTH);
}

/**
 * Generates a URL-safe, unique username from the user's name (falls back to email prefix).
 * Example: "Sufyan Ahmed" → "sufyan-ahmed", if taken → "sufyan-ahmed-1", etc.
 */
export async function generateUniqueUsername(
  name: string | null | undefined,
  email: string
): Promise<string> {
  const baseSource = name?.trim() || email.split("@")[0] || "user";
  const base = slugify(baseSource) || "user";

  let candidate = base;
  let suffix = 1;

  while (suffix <= MAX_ATTEMPTS) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix++;
  }

  // Extremely unlikely — fallback with timestamp
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}