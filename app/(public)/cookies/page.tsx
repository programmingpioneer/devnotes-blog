import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/shared/LegalLayout";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Cookie Policy for ${siteConfig.title}.`,
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  const { legal, title } = siteConfig;

  return (
      <LegalLayout eyebrow="Legal" title="Cookie Policy" lastUpdated={legal.lastUpdated}>
      <p>
        This Cookie Policy explains how {title} uses cookies and similar
        technologies such as <code>localStorage</code>. It should be read
        together with our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your browser.
        They allow a website to recognize your browser across requests and
        maintain state such as your login session.
      </p>

      <h2>2. Cookies and Storage We Use</h2>

      <h3>2.1 Strictly necessary</h3>
      <ul>
        <li>
          <strong>Authentication session cookie</strong> — set by our
          authentication layer to keep you signed in. Without this cookie,
          you cannot log in. Lifetime: session or up to 30 days, depending
          on &ldquo;remember me&rdquo;.
        </li>
        <li>
          <strong>CSRF protection token</strong> — set to prevent cross-site
          request forgery on forms. Lifetime: session.
        </li>
      </ul>

      <h3>2.2 Functional (browser storage)</h3>
      <ul>
        <li>
          <strong>Theme preference</strong> — stored in{" "}
          <code>localStorage</code> as <code>theme</code>, holding either{" "}
          <code>&quot;light&quot;</code> or <code>&quot;dark&quot;</code>.
          It has no expiry and is only readable by this site.
        </li>
      </ul>

      <h3>2.3 Analytics</h3>
      <p>
        We do not currently use analytics or advertising cookies. If we add
        them in the future, we will update this policy and, where required,
        ask for your consent first.
      </p>

      <h2>3. What We Do NOT Use</h2>
      <ul>
        <li>Third-party advertising cookies.</li>
        <li>Cross-site tracking cookies.</li>
        <li>Data broker or resale tracking.</li>
      </ul>

      <h2>4. Managing Cookies</h2>
      <p>
        You can control or delete cookies through your browser settings. Most
        browsers allow you to block cookies entirely, though doing so will
        prevent you from staying signed in.
      </p>
      <p>
        To clear the theme preference, clear site data for this site in your
        browser&apos;s developer tools or settings.
      </p>

      <h2>5. Consent</h2>
      <p>
        Strictly necessary cookies are set on the basis of our legitimate
        interest in operating a secure service and do not require consent
        under most privacy laws. If we add non-essential cookies in the
        future, we will ask for your consent first.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update this Cookie Policy as our practices change. The
        &ldquo;Last updated&rdquo; date above reflects the most recent
        revision.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about cookies? Reach us at{" "}
        <strong>{legal.contactEmail}</strong>.
      </p>
    </LegalLayout>
  );
}