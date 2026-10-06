import Link from "next/link";
import type { FeaturedCollection } from "@/lib/content/collections";

type Props = {
  collection: FeaturedCollection | null;
};

export default function FeaturedCollectionCard({ collection }: Props) {
  if (!collection) return null;

  return (
    <section
      aria-label="Featured collection"
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft-md"
    >
      <div className="relative z-10 max-w-[68%]">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Featured Collection
        </p>
        <h3 className="mt-2 text-base font-semibold tracking-tight">
          {collection.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {collection.description}
        </p>
        <Link
          href="/topics"
          className="mt-4 inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-token hover:border-accent/40 hover:text-accent"
        >
          Explore Collection
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Decorative 3D cube — pure SVG, no asset */}
      <svg
        aria-hidden
        viewBox="0 0 120 120"
        className="pointer-events-none absolute -right-4 bottom-0 h-32 w-32 opacity-90 transition-transform duration-300 group-hover:-translate-y-1"
      >
        <defs>
          <linearGradient id="cube-top" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="cube-left" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="cube-right" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.75" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <g className="text-accent">
          <polygon points="60,20 100,40 60,60 20,40" fill="url(#cube-top)" />
          <polygon points="20,40 60,60 60,105 20,85" fill="url(#cube-left)" />
          <polygon points="100,40 100,85 60,105 60,60" fill="url(#cube-right)" />
        </g>
      </svg>
    </section>
  );
}