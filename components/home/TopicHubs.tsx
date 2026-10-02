import Link from "next/link";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import type { TopicWithCount } from "@/lib/content/topics";

type TopicHubsProps = {
  topics: TopicWithCount[];
};

export default function TopicHubs({ topics }: TopicHubsProps) {
  return (
    <div>
      <RevealOnScroll>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Topics</h2>
      </RevealOnScroll>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic, i) => {
          const isEmpty = topic.count === 0;

          return (
            <RevealOnScroll key={topic.slug} delay={i * 80} className="h-full">
              <Link
                href={`/topics/${topic.slug}`}
                className={`group flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft-md ${
                  isEmpty ? "opacity-70" : ""
                }`}
              >
                <p
                  className={`text-2xl font-semibold tabular-nums ${
                    isEmpty ? "text-muted" : "text-accent"
                  }`}
                >
                  {topic.count}
                </p>

                <h3 className="text-base font-semibold tracking-tight group-hover:text-accent">
                  {topic.name}
                </h3>

                <p className="text-sm text-muted">{topic.description}</p>

                <span
                  className={`mt-2 text-xs text-muted ${
                    isEmpty ? "italic" : ""
                  }`}
                >
                  {topic.count === 1 ? "1 post" : `${topic.count} posts`}
                </span>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}