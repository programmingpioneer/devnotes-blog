import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import matter from "gray-matter";
import { postFrontmatterSchema } from "../lib/content/schema";

const prisma = new PrismaClient();
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_EMAIL not set in .env");

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    throw new Error(`Admin user "${adminEmail}" not found. Run seed first.`);
  }

  if (!fs.existsSync(POSTS_DIR)) {
    console.log("No content/posts directory — nothing to migrate.");
    return;
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${files.length} MDX file(s).`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const parsed = postFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`✗ ${slug}: invalid frontmatter — skipped`);
      skipped++;
      continue;
    }

    const post = parsed.data;

    // Ensure all tags exist
    const tagIds = await Promise.all(
      post.tags.map(async (raw) => {
        const name = raw.toLowerCase().trim();
        const tag = await prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        });
        return tag.id;
      })
    );

    const existing = await prisma.post.findUnique({ where: { slug } });

    if (existing) {
      // Update metadata + content, replace tags
      await prisma.postTag.deleteMany({ where: { postId: existing.id } });
      await prisma.post.update({
        where: { slug },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content,
          date: new Date(post.date),
          pillar: post.pillar ?? null,
          status: post.draft ? "DRAFT" : "PUBLISHED",
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        },
      });
      console.log(`↻ ${slug} — updated (${post.tags.length} tags)`);
      updated++;
      continue;
    }

    await prisma.post.create({
      data: {
        slug,
        title: post.title,
        excerpt: post.excerpt,
        content,
        date: new Date(post.date),
        pillar: post.pillar ?? null,
        status: post.draft ? "DRAFT" : "PUBLISHED",
        authorId: admin.id,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });

    console.log(`✓ ${slug} — created (${post.tags.length} tags)`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });