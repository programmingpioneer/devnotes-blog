import { siteConfig } from "@/content/config";

type DeletionCodeProps = {
  name?: string | null;
  email: string;
  code: string;
};

function firstName(name?: string | null, email?: string): string {
  if (name && name.trim()) return name.trim().split(" ")[0];
  if (email) {
    const prefix = email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "there";
}

export default function DeletionCodeTemplate({
  name,
  email,
  code,
}: DeletionCodeProps) {
  const greeting = firstName(name, email);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Confirm account deletion</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Confirm account deletion</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Hi ${greeting},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">You requested to delete your ${siteConfig.title} account. Enter this code to confirm:</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;" align="center">
              <div style="display: inline-block; padding: 18px 32px; background-color: #fff0f0; border: 1px solid #ffd8d8; border-radius: 10px;">
                <span style="font-family: 'SF Mono', Menlo, Consolas, 'Courier New', monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #d63d3d; padding-left: 10px;">${code}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6b6b6b;">This code expires in <strong style="color: #0d0d0d;">10 minutes</strong>. Once you confirm, your account enters a <strong style="color: #0d0d0d;">15-day grace period</strong> before permanent deletion.</p>
              <p style="margin: 0; font-size: 14px; color: #6b6b6b;">If you didn't request this, ignore this email — your account stays safe and no deletion will occur.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">For your security, never share this code with anyone. ${siteConfig.title} will never ask you for this code.</p>
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