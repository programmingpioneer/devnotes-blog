import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}