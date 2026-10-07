import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/shared/LegalLayout";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.title}.`,
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <LegalLayout eyebrow="Contact" title="Get in touch">
      <p>
        Have a question, found a bug, or want to suggest a feature? Reach out
        through any of the channels below.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <a
          href={`mailto:${siteConfig.legal.contactEmail}`}
          className="group rounded-lg border border-border bg-accent/[0.02] p-4 transition-colors hover:border-accent/40"
        >
          <div className="flex items-center gap-2 text-foreground">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <span className="text-sm font-semibold">Email</span>
          </div>
          <p className="mt-2 text-sm break-all text-muted">
            {siteConfig.legal.contactEmail}
          </p>
        </a>

        <div className="rounded-lg border border-border bg-accent/[0.02] p-4">
          <div className="flex items-center gap-2 text-foreground">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-sm font-semibold">Location</span>
          </div>
          <p className="mt-2 text-sm text-muted">{siteConfig.legal.address}</p>
        </div>

        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-lg border border-border bg-accent/[0.02] p-4 transition-colors hover:border-accent/40"
        >
          <div className="flex items-center gap-2 text-foreground">
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="text-sm font-semibold">GitHub</span>
          </div>
          <p className="mt-2 text-sm break-all text-muted">
            {siteConfig.repo.owner}/{siteConfig.repo.name}
          </p>
        </a>
      </div>

      <h2>What to expect</h2>
      <p>
        I usually reply within a few days. If you are reporting a bug, include
        the steps to reproduce it and any error messages you saw — it makes
        fixing things much faster.
      </p>

      <h2>Common questions</h2>
      <p>
        Many common questions are already answered on the{" "}
        <Link href="/faq">FAQ page</Link>. Worth a look before emailing.
      </p>
    </LegalLayout>
  );
}