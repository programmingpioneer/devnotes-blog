import Link from "next/link";

type LegalLayoutProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: {lastUpdated}</p>
      </header>

      <div className="mt-8 rounded-lg border border-accent/30 bg-accent/[0.04] p-4 text-sm">
        <p className="font-semibold text-foreground">Template notice</p>
        <p className="mt-1 leading-relaxed text-muted">
          This document is a structural template and has not been reviewed by
          a qualified legal professional. Replace every bracketed placeholder
          with your actual details and have a lawyer review the final text
          before relying on it.
        </p>
      </div>

      <div
        className="mt-10 space-y-6 text-sm leading-relaxed text-muted
          [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground
          [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
          [&_p]:leading-relaxed
          [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
          [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5
          [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-accent
          [&_strong]:font-semibold [&_strong]:text-foreground"
      >
        {children}
      </div>

      <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-xs text-muted">
        <Link href="/privacy" className="hover:text-foreground">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms of Service
        </Link>
        <Link href="/cookies" className="hover:text-foreground">
          Cookie Policy
        </Link>
        <Link href="/faq" className="hover:text-foreground">
          FAQ
        </Link>
        <Link href="/contact" className="hover:text-foreground">
          Contact
        </Link>
      </footer>
    </article>
  );
}