import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SearchInput from "@/components/shared/SearchInput";
import PostCard from "@/components/post/PostCard";
import EmptyState from "@/components/shared/EmptyState";
import TagPill from "@/components/shared/TagPill";
import { getAllPosts, getAllPostsWithContent } from "@/lib/content/posts";
import { getAllTags } from "@/lib/content/topics";
import { searchPosts } from "@/lib/search/query";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all articles.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const user = await getCurrentUser();
  const canLike = !!user;

  const allMeta = await getAllPosts();
  const allTags = (await getAllTags()).slice(0, 10);

  let results: ReturnType<typeof searchPosts> = [];

  if (query) {
    const withContent = await getAllPostsWithContent(user?.id);
    results = searchPosts(withContent, query);
  }

  return (
    <Container>
      <Section>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Search
        </h1>
        <p className="mt-3 text-muted">
          Search across {allMeta.length} article{allMeta.length === 1 ? "" : "s"}.
        </p>

        <div className="mt-6 max-w-2xl">
          <SearchInput autoFocus />
        </div>
      </Section>

      {!query && (
        <Section>
          <p className="mb-4 text-sm font-medium text-muted">
            Popular tags
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ tag, count }) => (
              <TagPill key={tag} tag={`${tag} (${count})`} asLink={false} />
            ))}
          </div>
        </Section>
      )}

      {query && results.length === 0 && (
        <Section>
          <EmptyState
            title={`No results for "${query}"`}
            description="Try a different keyword, or browse topics."
            action={{ label: "Browse topics", href: "/topics" }}
          />
        </Section>
      )}

      {query && results.length > 0 && (
        <Section>
          <p className="mb-6 text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <span className="text-foreground">&quot;{query}&quot;</span>
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {results.map((post) => (
              <PostCard key={post.slug} post={post} canLike={canLike} />
            ))}
          </div>
        </Section>
      )}
    </Container>
  );
}