import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import type { ProfileLink } from "@/lib/profile/schemas";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePostList, {
  type ProfilePost,
} from "@/components/profile/ProfilePostList";

type PageProps = {
  params: Promise<{ username: string }>;
};

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
      coverImage: true,
      links: true,
      createdAt: true,
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) return { title: "Profile not found" };

  return {
    title: `${user.name ?? user.username} (@${user.username})`,
    description: user.bio?.slice(0, 160) ?? undefined,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await getUser(username);
  if (!user) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      ...(canEdit ? {} : { status: "PUBLISHED" }),
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      date: true,
      status: true,
    },
  });

  const profilePosts: ProfilePost[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    status: p.status,
  }));

  const links = (user.links as ProfileLink[] | null) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <ProfileHeader
        name={user.name}
        username={user.username}
        email={user.email}
        image={user.image}
        bio={user.bio}
        coverImage={user.coverImage}
        links={links}
        isOwner={canEdit}
      />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {isOwner ? "Your articles" : "Articles"}
          </h2>
          {profilePosts.length > 0 && (
            <span className="text-sm text-muted">
              {profilePosts.length}{" "}
              {profilePosts.length === 1 ? "post" : "posts"}
            </span>
          )}
        </div>

        <ProfilePostList posts={profilePosts} isOwner={isOwner} />
      </section>

      {!isOwner && (
        <div className="mt-12 border-t border-border pt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      )}
    </div>
  );
}
