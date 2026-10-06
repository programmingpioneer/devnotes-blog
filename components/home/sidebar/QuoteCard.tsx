export default function QuoteCard() {
  return (
    <section
      aria-label="Quote"
      className="rounded-xl border border-border bg-card p-5 shadow-soft-sm"
    >
      <span aria-hidden className="block text-3xl leading-none text-accent">
        &ldquo;
      </span>
      <blockquote className="mt-2 text-sm italic leading-relaxed text-foreground">
        Good developers write code. Great developers write notes.
      </blockquote>
      <cite className="mt-3 block text-xs not-italic text-muted">
        — DevNotes
      </cite>
    </section>
  );
}