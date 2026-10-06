import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running seed"
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`↻ Admin already exists: ${email} (role: ${existing.role})`);
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`✓ Promoted to ADMIN`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Admin created: ${admin.email} (id: ${admin.id})`);
}

async function seedFeaturedCollection() {
  const slug = "modern-web-development";
  const existing = await prisma.collection.findUnique({ where: { slug } });

  if (existing) {
    console.log(`↻ Collection already exists: ${slug}`);
    return;
  }

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    take: 5,
    select: { id: true },
  });

  if (posts.length === 0) {
    console.log(`↻ No published posts found — skipping collection seed`);
    return;
  }

  const collection = await prisma.collection.create({
    data: {
      slug,
      title: "Modern Web Development",
      description:
        "Curated collection of the most important articles for modern web developers.",
      featured: true,
      posts: {
        create: posts.map((p, idx) => ({
          postId: p.id,
          position: idx,
        })),
      },
    },
  });

  console.log(
    `✓ Collection created: ${collection.slug} (${posts.length} posts attached)`
  );
}

async function main() {
  await seedAdmin();
  await seedFeaturedCollection();
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });