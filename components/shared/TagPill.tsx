import Link from "next/link";
import { cn } from "@/lib/utils";

type TagPillProps = {
  tag: string;
  className?: string;
  asLink?: boolean;
};

export default function TagPill({
  tag,
  className,
  asLink = true,
}: TagPillProps) {
    const classes = cn(
    "inline-flex items-center rounded-full border border-border bg-subtle px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:border-accent hover:bg-accent/[0.05] hover:text-accent",
    className
  );

  const label = `#${tag}`;

  if (asLink) {
    return (
      <Link href={`/tags/${tag}`} className={classes}>
        {label}
      </Link>
    );
  }

  return <span className={classes}>{label}</span>;
}