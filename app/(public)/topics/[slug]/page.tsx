import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Prose from "@/components/post/Prose";
import PostCard from "@/components/post/PostCard";
import EmptyState from "@/components/shared/EmptyState";
import JSONLD from "@/components/shared/JSONLD";
import {
  getTopicBySlug,
  getPostsByPillar,
  getPillarContent,
} from "@/lib/content/topics";
import { topics } from "@/content/topics";
import { siteConfig } from "@/content/config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Topic not found" };

  const url = siteConfig.url + "/topics/" + topic.slug;
  return {
    title: topic.name,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: topic.name + " â€” " + siteConfig.title,
      description: topic.description,
    },
  };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const posts = await getPostsByPillar(slug);
  const pillarContent = getPillarContent(slug);
  const [startHere, ...rest] = posts;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: topic.description,
    url: siteConfig.url + "/topics/" + topic.slug,
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: siteConfig.url + "/posts/" + p.slug,
      datePublished: p.date,
    })),
  };

  return (
    <Container>
      <JSONLD data={collectionJsonLd} />

      <Section>
        <p className="text-sm text-muted">Topic</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
          {topic.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{topic.description}</p>

        {pillarContent && (
          <div className="mt-8 max-w-3xl">
            <Prose>
              <MDXRemote source={pillarContent} />
            </Prose>
          </div>
        )}
      </Section>

      {posts.length === 0 ? (
        <Section>
          <EmptyState
            title="No posts in this topic yet"
            description="New articles are on the way. Check back soon."
            action={{ label: "Browse all topics", href: "/topics" }}
          />
        </Section>
      ) : (
        <>
          <Section>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              Start here
            </h2>
            <PostCard post={startHere} variant="featured" />
          </Section>

          {rest.length > 0 && (
            <Section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                All articles
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </Container>
  );
}