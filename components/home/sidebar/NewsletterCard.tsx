"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterCard() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Newsletter submission intentionally not wired yet — UI-only shell.
    // A future chunk will connect this to /api/newsletter/subscribe.
  }

  return (
    <section
      aria-label="Newsletter signup"
      className="rounded-xl border border-border bg-card p-5 shadow-soft-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        Stay in the Loop
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Get the latest posts, tutorials, and insights delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="w-full min-w-0 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-background transition-token hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}