import Link from "next/link";
import { siteConfig } from "@/content/config";

const topics = [
  {
    title: "Backend architecture",
    body: "Designing services that stay maintainable as they grow — boundaries, data flow, and failure modes.",
  },
  {
    title: "Production web systems",
    body: "Real constraints of shipping web apps: auth, caching, migrations, observability, and cost.",
  },
  {
    title: "Engineering notes",
    body: "Short write-ups on tools, patterns, and the trade-offs behind decisions I've had to make.",
  },
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          About
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {siteConfig.title} is where I write about building production web
          software — the parts that don&apos;t fit in a tweet.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        <p className="leading-relaxed">
          I&apos;m a full-stack engineer focused on backend architecture and
          the practical side of shipping web applications. Most of what I
          write comes from work that was already shipped, not from isolated
          demos.
        </p>
        <p className="leading-relaxed">
          The goal here is simple: clear, technical writing with real
          trade-offs. No fluff, no spin — just the reasoning behind decisions,
          what went wrong, and what I&apos;d do differently next time.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          What I write about
        </h2>
        <ul className="mt-6 space-y-6">
          {topics.map((topic) => (
            <li key={topic.title}>
              <h3 className="text-base font-semibold tracking-tight">
                {topic.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {topic.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-semibold tracking-tight">Get in touch</h2>
               <p className="mt-3 text-sm leading-relaxed text-muted">
          You can reach me by{" "}
          <a
            href={`mailto:${siteConfig.legal.contactEmail}`}
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            email
          </a>{" "}
          or through the{" "}
          <Link
            href="/contact"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            contact page
          </Link>
          . Code lives on{" "}
          <Link
            href={siteConfig.social.github}
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            GitHub
          </Link>
          , and if you&apos;d rather follow along quietly, the{" "}
          <Link
            href={siteConfig.social.rss}
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            RSS feed
          </Link>{" "}
          is the cleanest way.
        </p>
      </section>
    </article>
  );
}