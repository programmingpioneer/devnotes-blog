import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import TopicHubs from "@/components/home/TopicHubs";
import { getTopicStats } from "@/lib/content/topics";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse all topics — frontend, backend, DevOps, and AI engineering.",
};

export default async function TopicsIndexPage() {
  const topics = await getTopicStats();

  return (
    <Container>
      <Section>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          EXPLORE
        </p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight md:text-5xl">
          Topics
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Deep dives organized by discipline. Each topic is a curated path —
          start at the top, work your way through.
        </p>
      </Section>

      <Section>
        <TopicHubs topics={topics} />
      </Section>
    </Container>
  );
}