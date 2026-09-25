import { siteConfig } from "@/content/config";

type WelcomeEmailProps = {
  name?: string | null;
  email: string;
};

function firstName(name?: string | null, email?: string): string {
  if (name && name.trim()) return name.trim().split(" ")[0];
  if (email) {
    const prefix = email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "there";
}

export default function WelcomeEmailTemplate({
  name,
  email,
}: WelcomeEmailProps) {
  const greeting = firstName(name, email);
  const siteUrl = siteConfig.url;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Welcome to ${siteConfig.title}</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Welcome aboard, ${greeting}!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">Your email is verified and your account is ready. We're glad to have you here.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 20px;">
              <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #0d0d0d;">What you can do next:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b4b4b;">&#8226; Read the latest articles on production-grade web development and backend architecture</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b4b4b;">&#8226; Explore topic hubs and dive deep into the subjects that matter to you</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b4b4b;">&#8226; Update your profile and personalize your experience</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #4d6bfe;">
                    <a href="${siteUrl}/dashboard" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 8px;">Go to dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">You're receiving this email because you created an account on ${siteConfig.title}. If this wasn't you, please ignore this message.</p>
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