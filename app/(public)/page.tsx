import { Suspense } from "react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import HomeHero from "@/components/home/HomeHero";
import TopicHubs from "@/components/home/TopicHubs";
import RecentGrid from "@/components/home/RecentGrid";
import SearchCard from "@/components/home/sidebar/SearchCard";
import FeaturedCollectionCard from "@/components/home/sidebar/FeaturedCollectionCard";
import TopicListCard from "@/components/home/sidebar/TopicListCard";
import NewsletterCard from "@/components/home/sidebar/NewsletterCard";
import QuoteCard from "@/components/home/sidebar/QuoteCard";
import { getAllPosts } from "@/lib/content/posts";
import { getTopicStats } from "@/lib/content/topics";
import { getFeaturedCollection } from "@/lib/content/collections";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  const posts = await getAllPosts(user?.id);
  const topics = await getTopicStats();
  const collection = await getFeaturedCollection();

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

  const [featured, ...recentPosts] = posts;

  return (
    <Container>
      {/* FULL-WIDTH HERO (12 cols of container) */}
      <Section>
        <HomeHero featured={featured} canLike={!!user} />
      </Section>

      {/* BELOW HERO: MAIN (8) + SIDEBAR (4) */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <main className="flex flex-col gap-12 lg:col-span-8">
            <TopicHubs topics={topics} />
            {recentPosts.length > 0 && (
              <RecentGrid posts={recentPosts} canLike={!!user} />
            )}
          </main>

          <aside className="flex flex-col gap-5 lg:col-span-4">
            <Suspense fallback={null}>
              <SearchCard />
            </Suspense>
            <FeaturedCollectionCard collection={collection} />
            <TopicListCard topics={topics} />
            <NewsletterCard />
            <QuoteCard />
          </aside>
        </div>
      </Section>
    </Container>
  );
}