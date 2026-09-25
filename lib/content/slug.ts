import { prisma } from "@/lib/db/client";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")     // non-alphanumeric → hyphens
    .replace(/^-+|-+$/g, "")         // trim leading/trailing hyphens
    .slice(0, 80);
}

export async function generateUniquePostSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "post";

  let candidate = base;
  let suffix = 1;

  while (suffix <= 100) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${base}-${suffix}`;
    suffix++;
  }

  return `${base}-${Date.now().toString(36).slice(-4)}`;
}