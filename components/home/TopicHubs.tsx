import Link from "next/link";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import { getTopicIcon } from "@/components/shared/TopicIcon";
import type { TopicWithCount } from "@/lib/content/topics";

type TopicHubsProps = {
  topics: TopicWithCount[];
};

export default function TopicHubs({ topics }: TopicHubsProps) {
  return (
    <div>
      <RevealOnScroll>
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Explore Topics
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Browse by Topic
            </h2>
          </div>
          <Link
            href="/topics"
            className="hidden text-sm text-muted transition-colors hover:text-foreground sm:inline"
          >
            View all topics →
          </Link>
        </header>
      </RevealOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topics.map((topic, i) => {
          const isEmpty = topic.count === 0;
          const Icon = getTopicIcon(topic.slug);

          return (
            <RevealOnScroll key={topic.slug} delay={i * 80} className="h-full">
              <Link
                href={`/topics/${topic.slug}`}
                className={`group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft-md ${
                  isEmpty ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors group-hover:border-accent/40 group-hover:text-accent ${
                    isEmpty ? "text-muted" : "text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <h3 className="text-base font-semibold tracking-tight group-hover:text-accent">
                  {topic.name}
                </h3>

                <p className="text-sm leading-relaxed text-muted">
                  {topic.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
                  <span className={isEmpty ? "italic" : ""}>
                    {topic.count === 1
                      ? "1 post"
                      : `${topic.count} posts`}
                  </span>
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>

      <Link
        href="/topics"
        className="mt-4 inline-block text-sm text-muted transition-colors hover:text-foreground sm:hidden"
      >
        View all topics →
      </Link>
    </div>
  );
}
