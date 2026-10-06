import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import PostCard from "@/components/post/PostCard";
import EmptyState from "@/components/shared/EmptyState";
import { getPostsByTag, getAllTags } from "@/lib/content/topics";
import { siteConfig } from "@/content/config";
import { getCurrentUser } from "@/lib/auth/session";

type Params = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return (await getAllTags()).map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);
  if (posts.length === 0) return { title: "Tag not found" };

  const url = siteConfig.url + "/tags/" + tag;
  return {
    title: "#" + tag,
    description: posts.length + " article" + (posts.length === 1 ? "" : "s") + " tagged #" + tag + ".",
    alternates: { canonical: url },
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const user = await getCurrentUser();
  const posts = await getPostsByTag(tag, user?.id);
  const canLike = !!user;

  if (posts.length === 0) notFound();

  return (
    <Container>
      <Section>
        <p className="text-sm text-muted">Tag</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
          #{tag}
        </h1>
        <p className="mt-3 text-muted">
          {posts.length} article{posts.length === 1 ? "" : "s"}
        </p>
      </Section>

      {posts.length === 0 ? (
        <Section>
          <EmptyState
            title="No posts found"
            description="Try browsing topics instead."
            action={{ label: "Browse topics", href: "/topics" }}
          />
        </Section>
      ) : (
        <Section>
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} canLike={canLike} />
            ))}
          </div>
        </Section>
      )}
    </Container>
  );
}