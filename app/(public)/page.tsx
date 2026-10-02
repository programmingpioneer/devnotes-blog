import { Suspense } from "react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import HeroEditorial from "@/components/home/HeroEditorial";
import AnimatedHero from "@/components/home/AnimatedHero";
import TopicHubs from "@/components/home/TopicHubs";
import RecentGrid from "@/components/home/RecentGrid";
import SearchInput from "@/components/shared/SearchInput";
import { getAllPosts } from "@/lib/content/posts";
import { getTopicStats } from "@/lib/content/topics";

export default async function HomePage() {
  const posts = await getAllPosts();
  const topics = await getTopicStats();

  if (posts.length === 0) {
    return (
      <Container>
        <Section>
          <h1 className="text-4xl font-semibold tracking-tight">
            Production-level Web Dev & Backend Architecture.
          </h1>
          <p className="mt-6 text-muted">
            No articles published yet. Check back soon.
          </p>
        </Section>
      </Container>
    );
  }

  const [featured, ...rest] = posts;
  const sidePosts = rest.slice(0, 3);
  const recentPosts = rest.slice(3);

  return (
    <Container>
      <Section>
        <AnimatedHero />
      </Section>

      <Section>
        <Suspense fallback={null}>
          <SearchInput />
        </Suspense>
      </Section>

      <Section>
        <HeroEditorial featured={featured} sidePosts={sidePosts} />
      </Section>

      <Section>
        <TopicHubs topics={topics} />
      </Section>

      {recentPosts.length > 0 && (
        <Section>
          <RecentGrid posts={recentPosts} />
        </Section>
      )}
    </Container>
  );
}