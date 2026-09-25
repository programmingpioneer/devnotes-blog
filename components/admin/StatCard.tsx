import Link from "next/link";

type StatCardProps = {
  label: string;
  value: number | string;
  sublabel?: string;
  href?: string;
};

export default function StatCard({ label, value, sublabel, href }: StatCardProps) {
  const body = (
    <div className="rounded-xl border border-border bg-background p-5 transition-colors hover:border-accent/40">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl">
        {body}
      </Link>
    );
  }

  return body;
}