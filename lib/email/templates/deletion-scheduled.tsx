import { siteConfig } from "@/content/config";

type DeletionScheduledProps = {
  name?: string | null;
  email: string;
  scheduledFor: Date;
  postCount: number;
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

export default function DeletionScheduledTemplate({
  name,
  email,
  scheduledFor,
  postCount,
}: DeletionScheduledProps) {
  const greeting = firstName(name, email);
  const dateStr = formatDate(scheduledFor);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Your account is scheduled for deletion</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Account scheduled for deletion</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Hi ${greeting},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">We've received your request to delete your ${siteConfig.title} account. This email confirms the details.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b; width: 45%;">Deletion date:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d; font-weight: 600;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Account email:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Posts to be deleted:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d; font-weight: 600;">${postCount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Grace period:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">15 days</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #0d0d0d;">What happens next</h2>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b4b4b;">
                <li style="margin-bottom: 4px;">Your account remains accessible during the 15-day grace period.</li>
                <li style="margin-bottom: 4px;">If you sign in during this window, deletion is automatically cancelled.</li>
                <li style="margin-bottom: 4px;">On the scheduled date, your account and all associated data (posts, sessions, credentials) will be permanently deleted.</li>
                <li>This action is irreversible once completed.</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="padding: 16px; background-color: #fff8ec; border: 1px solid #fae2b8; border-radius: 10px;">
                <p style="margin: 0; font-size: 14px; color: #8a5a12;"><strong>Changed your mind?</strong> Simply sign in to ${siteConfig.title} before the deletion date. Your account will be automatically restored and you'll receive a confirmation email.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">If you did not request this deletion, please sign in immediately to cancel it and update your password.</p>
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