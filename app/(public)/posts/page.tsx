import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import PostCard from "@/components/post/PostCard";
import { getAllPosts } from "@/lib/content/posts";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Articles",
  description: "Notes, case studies, and lessons from shipping production systems.",
};

export default async function PostsPage() {
  const user = await getCurrentUser();
  const posts = await getAllPosts(user?.id);

  return (
    <Container>
      <Section>
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Articles
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Notes, case studies, and lessons from shipping production systems.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-muted">
            No articles published yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}