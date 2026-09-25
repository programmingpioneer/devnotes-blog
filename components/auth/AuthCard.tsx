import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: { text: string; linkText: string; href: string };
};

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </header>

      {children}

      {footer && (
        <p className="mt-6 text-center text-sm text-muted">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-accent hover:underline"
          >
            {footer.linkText}
          </Link>
        </p>
      )}
    </div>
  );
}