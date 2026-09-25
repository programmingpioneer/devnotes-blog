import { siteConfig } from "@/content/config";

type AccountRestoredProps = {
  name?: string | null;
  email: string;
  requestedAt: Date;
  restoredAt: Date;
};

function firstName(name?: string | null, email?: string): string {
  if (name && name.trim()) return name.trim().split(" ")[0];
  if (email) {
    const prefix = email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "there";
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

export default function AccountRestoredTemplate({
  name,
  email,
  requestedAt,
  restoredAt,
}: AccountRestoredProps) {
  const greeting = firstName(name, email);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Welcome back to ${siteConfig.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">

          <tr>
            <td style="padding: 28px 32px 12px;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b6b6b; letter-spacing: 0.05em; text-transform: uppercase;">${siteConfig.title}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 8px;">
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Welcome back, ${greeting}!</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Great to see you again.</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">Your account deletion request has been <strong style="color: #0d0d0d;">cancelled</strong>, and everything is restored. Your posts, settings, and profile are exactly as you left them.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fff4; border: 1px solid #c8f0d4; border-radius: 10px; padding: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4a6b55; width: 45%;">Deletion requested:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1a4b2b;">${formatDate(requestedAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4a6b55;">Account restored:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1a4b2b; font-weight: 600;">${formatDate(restoredAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4a6b55;">Status:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #1a4b2b; font-weight: 600;">Active</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #4b4b4b;">We're genuinely happy you decided to stay. ${siteConfig.title} is a better place with you in it. Take a moment to explore what's new, revisit your drafts, or share something you've been working on.</p>
              <p style="margin: 0; font-size: 15px; color: #4b4b4b;">If you ever need help or want to share feedback, just reply to this email.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="padding: 16px; background-color: #f0f3ff; border: 1px solid #d8deff; border-radius: 10px;">
                <p style="margin: 0; font-size: 14px; color: #33417a;"><strong>Didn't sign in recently?</strong> If this restore wasn't you, please reset your password immediately from your account settings.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">Thanks for being part of ${siteConfig.title}.<br/>— The team</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}