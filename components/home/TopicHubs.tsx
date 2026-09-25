import Link from "next/link";
import type { TopicWithCount } from "@/lib/content/topics";

type TopicHubsProps = {
  topics: TopicWithCount[];
};

export default function TopicHubs({ topics }: TopicHubsProps) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">
        Topics
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group flex flex-col gap-2 rounded-lg border border-border p-5 transition-colors hover:border-accent"
          >
            <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent">
              {topic.name}
            </h3>
            <p className="text-sm text-muted">{topic.description}</p>
            <span className="mt-2 text-xs text-muted">
              {topic.count} {topic.count === 1 ? "post" : "posts"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}