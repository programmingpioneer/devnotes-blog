import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/shared/LegalLayout";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.title}.`,
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const { legal, title } = siteConfig;

  return (
    <LegalLayout title="Terms of Service" lastUpdated={legal.lastUpdated}>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of {title} (the &ldquo;Service&rdquo;), operated by{" "}
        <strong>{legal.companyName}</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By creating an account or
        using the Service, you agree to be bound by these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age of digital
        consent in your jurisdiction, whichever is higher) to use the
        Service. If you are under 18, you confirm that you have permission
        from a parent or legal guardian.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>
          You are responsible for maintaining the confidentiality of your
          account credentials.
        </li>
        <li>
          You agree to provide accurate information during registration and
          to keep it up to date.
        </li>
        <li>
          You are responsible for all activity that occurs under your
          account.
        </li>
        <li>
          Notify us immediately at <strong>{legal.contactEmail}</strong> if
          you suspect unauthorized access.
        </li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable law or regulation.</li>
        <li>
          Post content that is unlawful, defamatory, harassing, hateful, or
          infringes on intellectual property rights.
        </li>
        <li>
          Attempt to gain unauthorized access to the Service, other accounts,
          or related systems.
        </li>
        <li>
          Use automated tools to scrape, overload, or disrupt the Service.
        </li>
        <li>
          Impersonate another person or misrepresent your affiliation with
          any entity.
        </li>
      </ul>

      <h2>4. User Content</h2>
      <p>
        You retain ownership of content you submit (posts, profile details,
        images). By submitting content, you grant us a non-exclusive,
        worldwide, royalty-free license to host, display, and distribute that
        content solely for the purpose of operating the Service.
      </p>
      <p>
        You are solely responsible for your content and confirm that you have
        the rights necessary to publish it.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        The Service, including its design, code, and branding, is owned by{" "}
        {legal.companyName} and protected by applicable intellectual property
        laws. These Terms do not grant you any right to use our trademarks or
        logos without prior written permission.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may suspend or terminate your access at any time, with or without
        notice, if you violate these Terms or if we discontinue the Service.
        You may delete your account at any time from your account settings.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranties of any kind, express or implied,
        including merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the Service will be
        uninterrupted, error-free, or secure.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, {legal.companyName} shall not
        be liable for any indirect, incidental, special, consequential, or
        punitive damages arising out of or relating to your use of the
        Service.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of{" "}
        <strong>{legal.jurisdiction}</strong>, without regard to conflict of
        law principles. Any disputes shall be resolved in the courts located
        in {legal.jurisdiction}.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        communicated via the Service or email. Continued use after changes
        take effect constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Reach us at{" "}
        <strong>{legal.contactEmail}</strong> or through our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <p className="text-xs text-muted">
        Mailing address: {legal.address}
      </p>
    </LegalLayout>
  );
}