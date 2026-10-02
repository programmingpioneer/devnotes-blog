import { siteConfig } from "@/content/config";
import { escapeHtml } from "@/lib/email/escape";

// Suggested subject: Pending review queue has reached {pendingCount} posts
type PendingAlertAdminProps = {
  pendingCount: number;
  topPosts: Array<{ id: string; title: string; authorName: string }>;
  queueUrl: string;
};

export default function PendingAlertAdminTemplate({
  pendingCount,
  topPosts,
  queueUrl,
}: PendingAlertAdminProps) {
  const safeQueueUrl = escapeHtml(queueUrl);
  const capped = topPosts.slice(0, 5);

  const rowsHtml = capped
    .map((post) => {
      const title = escapeHtml(post.title);
      const author = escapeHtml(post.authorName);
      const adminUrl = escapeHtml(`/admin/posts/${post.id}`);
      return `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <a href="${adminUrl}" style="font-size: 14px; font-weight: 600; color: #0d0d0d; text-decoration: none;">${title}</a>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #6b6b6b;">by ${author}</p>
                  </td>
                </tr>`;
    })
    .join("");

  const moreCount = pendingCount - capped.length;
  const moreLine =
    moreCount > 0
      ? `<p style="margin: 12px 0 0; font-size: 13px; color: #6b6b6b;">…and ${moreCount} more pending ${moreCount === 1 ? "post" : "posts"}.</p>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Pending review queue is filling up</title>
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
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Pending review queue is filling up</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">You now have <strong style="color: #0d0d0d;">${pendingCount} posts pending review</strong>. Reviewing promptly keeps members engaged and prevents backlog.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Oldest in queue</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 12px 16px;">
                ${rowsHtml}
              </table>
              ${moreLine}
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <a href="${safeQueueUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d0d0d; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Open queue →</a>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">Automated admin notification from ${siteConfig.title}. You are receiving this because the pending queue has crossed the alert threshold.</p>
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