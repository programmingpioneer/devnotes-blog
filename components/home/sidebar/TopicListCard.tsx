import Link from "next/link";
import type { TopicWithCount } from "@/lib/content/topics";

type TopicListCardProps = { topics: TopicWithCount[] };

export default function TopicListCard({ topics }: TopicListCardProps) {
  if (topics.length === 0) return null;

  return (
    <section aria-label="Browse by topic" className="rounded-xl border border-border bg-card p-5 shadow-soft-sm">
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-accent">
          Browse by Topic
        </h3>
        <Link href="/topics" className="text-xs text-muted transition-colors hover:text-foreground">
          View all →
        </Link>
      </header>

      <ul className="flex flex-col divide-y divide-border">
        {topics.map((topic) => {
          const isEmpty = topic.count === 0;
          return (
            <li key={topic.slug}>
              <Link
                href={`/topics/${topic.slug}`}
                className={`group flex items-center justify-between gap-3 py-3 transition-colors hover:text-accent ${
                  isEmpty ? "opacity-70" : ""
                }`}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{topic.name}</span>
                  <span className="text-xs text-muted">
                    {topic.count === 1 ? "1 post" : `${topic.count} posts`}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                >
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}