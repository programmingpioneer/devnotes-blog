import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import TopicHubs from "@/components/home/TopicHubs";
import { getTopicStats } from "@/lib/content/topics";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse all topics â€” frontend, backend, DevOps, and AI engineering.",
};

export default async function TopicsIndexPage() {
  const topics = await getTopicStats();

  return (
    <Container>
      <Section>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Topics
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Deep dives organized by discipline. Each topic is a curated path â€”
          start at the top, work your way through.
        </p>
      </Section>

      <Section>
        <TopicHubs topics={topics} />
      </Section>
    </Container>
  );
}