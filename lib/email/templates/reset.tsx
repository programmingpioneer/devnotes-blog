import { siteConfig } from "@/content/config";

type ResetProps = {
  name?: string | null;
  email: string;
  resetUrl: string;
};

function firstName(name?: string | null, email?: string): string {
  if (name && name.trim()) return name.trim().split(" ")[0];
  if (email) {
    const prefix = email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "there";
}

export default function ResetPasswordTemplate({
  name,
  email,
  resetUrl,
}: ResetProps) {
  const greeting = firstName(name, email);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Reset your password</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Reset your password</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Hi ${greeting},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">We received a request to reset your password on ${siteConfig.title}. Click the button below to choose a new one. This link expires in <strong style="color: #0d0d0d;">1 hour</strong>.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #4d6bfe;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 8px;">Reset password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">Or paste this link into your browser:</p>
              <div style="padding: 12px 14px; background-color: #f7f7f8; border: 1px solid #e5e5e5; border-radius: 8px;">
                <p style="margin: 0; font-family: 'SF Mono', Menlo, Consolas, 'Courier New', monospace; font-size: 12px; color: #4d6bfe; word-break: break-all; line-height: 1.5;">
                  <a href="${resetUrl}" style="color: #4d6bfe; text-decoration: none;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #8a8a8a;">If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will stay unchanged. For your security, never share this link with anyone.</p>
              <p style="margin: 0; font-size: 12px; color: #b0b0b0;">Sent to ${email}</p>
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