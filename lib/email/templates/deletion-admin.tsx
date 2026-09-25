import { siteConfig } from "@/content/config";

type DeletionAdminProps = {
  userName: string | null;
  userEmail: string;
  username: string | null;
  userId: string;
  requestedAt: Date;
  scheduledFor: Date;
  postCount: number;
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function DeletionAdminTemplate({
  userName,
  userEmail,
  username,
  userId,
  requestedAt,
  scheduledFor,
  postCount,
}: DeletionAdminProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>New deletion request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">

          <tr>
            <td style="padding: 28px 32px 12px;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b6b6b; letter-spacing: 0.05em; text-transform: uppercase;">${siteConfig.title} · Admin Alert</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 8px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">New account deletion request</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">A user has confirmed a request to delete their account. Review the details below and take action from the admin panel.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">User information</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b; width: 40%;">Name:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${userName ?? "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Email:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Username:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${username ? "@" + username : "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">User ID:</td>
                  <td style="padding: 6px 0; font-size: 12px; color: #0d0d0d; font-family: 'SF Mono', Menlo, Consolas, monospace;">${userId}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Request details</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b; width: 40%;">Requested at:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${formatDate(requestedAt)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Scheduled deletion:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #d63d3d; font-weight: 600;">${formatDate(scheduledFor)}</td>
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
              <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Impact</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff0f0; border: 1px solid #ffd8d8; border-radius: 10px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b; width: 40%;">Posts to delete:</td>
                  <td style="padding: 6px 0; font-size: 16px; color: #d63d3d; font-weight: 700;">${postCount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Sessions & credentials:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #d63d3d;">Will be removed</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="padding: 16px; background-color: #f0f3ff; border: 1px solid #d8deff; border-radius: 10px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #33417a; font-weight: 600;">Next steps</p>
                <p style="margin: 0; font-size: 14px; color: #33417a;">Sign in to the admin panel and visit <strong>Deletion Requests</strong> to review this case. You can delete now (bypass grace period) or wait for the scheduled date.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">This is an automated admin notification from ${siteConfig.title}. Do not forward this email.</p>
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