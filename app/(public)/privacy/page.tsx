import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/shared/LegalLayout";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.title}.`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const { legal, title } = siteConfig;

  return (
      <LegalLayout eyebrow="Legal" title="Privacy Policy" lastUpdated={legal.lastUpdated}>
      <p>
        This Privacy Policy explains what data {title} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, how we use it, and the choices you have.
        We are the data controller for the personal information described
        below.
      </p>

      <h2>1. Data We Collect</h2>

      <h3>1.1 Information you provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, username, and a
          password hash (we never store plaintext passwords).
        </li>
        <li>
          <strong>Profile data:</strong> optional bio, avatar image, cover
          image, and social links you choose to add.
        </li>
        <li>
          <strong>Content:</strong> posts, comments, and any other material
          you submit through the Service.
        </li>
      </ul>

      <h3>1.2 Information collected automatically</h3>
      <ul>
        <li>
          <strong>Session data:</strong> an encrypted authentication cookie
          is set to keep you signed in.
        </li>
        <li>
          <strong>Local preferences:</strong> your theme choice (light/dark)
          is stored in your browser&apos;s <code>localStorage</code>.
        </li>
        <li>
          <strong>Server logs:</strong> basic request metadata such as IP
          address, user agent, and timestamps, retained for security and
          debugging.
        </li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <ul>
        <li>To operate your account and provide the Service.</li>
        <li>To send transactional emails (verification, password reset).</li>
        <li>To detect and prevent abuse, fraud, and security incidents.</li>
        <li>To improve the Service and diagnose technical issues.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal data.
      </p>

      <h2>3. Legal Bases (for users in the EU/UK)</h2>
      <ul>
        <li>
          <strong>Contract:</strong> processing necessary to provide the
          Service you signed up for.
        </li>
        <li>
          <strong>Legitimate interests:</strong> security, abuse prevention,
          and service improvement.
        </li>
        <li>
          <strong>Consent:</strong> for any optional features that require
          it.
        </li>
        <li>
          <strong>Legal obligation:</strong> when we are required by law to
          process data.
        </li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>We share data only with the following categories of processors:</p>
      <ul>
        <li>
          <strong>Hosting &amp; infrastructure:</strong> to run the Service.
        </li>
        <li>
          <strong>Object storage:</strong> to store uploaded images.
        </li>
        <li>
          <strong>Email delivery:</strong> to send transactional emails.
        </li>
        <li>
          <strong>Authentication provider:</strong> if you sign in through a
          third-party service.
        </li>
      </ul>
      <p>
        We may also disclose data when required by law or to protect the
        rights and safety of our users and the public.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain personal data only as long as necessary for the purposes
        described. Account data is deleted when you delete your account,
        subject to a short recovery window and to legal retention
        requirements.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access,
        correct, export, or delete your personal data, and to object to or
        restrict certain processing.
      </p>
      <p>
        To exercise these rights, contact us at{" "}
        <strong>{legal.contactEmail}</strong>. If you are in the EU/UK, you
        also have the right to lodge a complaint with your local supervisory
        authority.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard safeguards including password hashing,
        encrypted connections, and access controls. No system is perfectly
        secure; if we become aware of a breach affecting your data, we will
        notify you as required by law.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is not directed to children under 13. We do not knowingly
        collect data from children. If you believe a child has provided us
        with data, contact us and we will delete it.
      </p>

      <h2>9. International Transfers</h2>
      <p>
        Your data may be processed in countries outside your own. Where
        required, we rely on appropriate safeguards such as standard
        contractual clauses.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be communicated via the Service or email.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy-related questions, contact{" "}
        <strong>{legal.contactEmail}</strong> or use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <p className="text-xs text-muted">
        Mailing address: {legal.address}
      </p>
    </LegalLayout>
  );
}