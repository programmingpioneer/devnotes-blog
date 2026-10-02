import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about ${siteConfig.title}.`,
  robots: { index: true, follow: true },
};

type FaqItem = { q: string; a: React.ReactNode };

const items: FaqItem[] = [
  {
    q: `What is ${siteConfig.title}?`,
    a: (
      <>
        {siteConfig.title} is a blog focused on production-level web
        development and backend architecture — real case studies, war
        stories, and engineering notes from shipping software. See the{" "}
        <Link href="/about">about page</Link> for more.
      </>
    ),
  },
  {
    q: "Do I need an account to read posts?",
    a: (
      <>
        No. All published articles are public. An account is only required if
        you want to comment, save posts, or publish your own writing.
      </>
    ),
  },
  {
    q: "How do I create an account?",
    a: (
      <>
        Head to the <Link href="/register">registration page</Link> and sign
        up with your email address. You will receive a verification code by
        email to confirm your account.
      </>
    ),
  },
  {
    q: "I did not receive the verification email. What should I do?",
    a: (
      <>
        Check your spam folder first. If it is not there, return to the
        verification screen and use the resend option. If the problem
        persists, <Link href="/contact">contact us</Link>.
      </>
    ),
  },
  {
    q: "How do I reset my password?",
    a: (
      <>
        Go to the <Link href="/forgot-password">forgot password page</Link>{" "}
        and enter the email address tied to your account. We will send a
        reset link.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        You can request deletion from your{" "}
        <Link href="/dashboard/settings">account settings</Link>. We will
        send a confirmation code to your email; once you confirm, your
        account enters a short recovery window and is then permanently
        deleted. See our <Link href="/privacy">Privacy Policy</Link> for
        details on data retention.
      </>
    ),
  },
  {
    q: "Can I write for this blog?",
    a: (
      <>
        Yes. Create an account and you will be able to submit posts from your
        dashboard. All submissions are reviewed before publication.
      </>
    ),
  },
  {
    q: "How do I report a bug or suggest a feature?",
    a: (
      <>
        Use the <Link href="/contact">contact page</Link> to send us a
        message. Include steps to reproduce the issue if you can.
      </>
    ),
  },
  {
    q: "Is my data safe?",
    a: (
      <>
        We use modern safeguards including hashed passwords, encrypted
        connections, and access controls. See the{" "}
        <Link href="/privacy">Privacy Policy</Link> for the full detail of
        what we collect and how we protect it.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Help
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-sm text-muted">
          Quick answers to the most common questions about {siteConfig.title}.
        </p>
      </header>

      <div className="mt-10 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium transition-colors hover:bg-accent/[0.03] [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform group-open:rotate-45"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-muted">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-accent/[0.03] p-5">
        <p className="text-sm font-semibold">Still need help?</p>
        <p className="mt-1 text-sm text-muted">
          Send us a message on the{" "}
          <Link
            href="/contact"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            contact page
          </Link>
          .
        </p>
      </div>
    </article>
  );
}