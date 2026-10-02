import { siteConfig } from "@/content/config";
import { escapeHtml } from "@/lib/email/escape";

// Suggested subject: New post pending review: "{postTitle}"
type PostSubmittedAdminProps = {
  authorName: string;
  authorEmail: string;
  postTitle: string;
  postExcerpt: string;
  queueUrl: string;
  pendingCount: number;
};

export default function PostSubmittedAdminTemplate({
  authorName,
  authorEmail,
  postTitle,
  postExcerpt,
  queueUrl,
  pendingCount,
}: PostSubmittedAdminProps) {
  const safeAuthorName = escapeHtml(authorName);
  const safeAuthorEmail = escapeHtml(authorEmail);
  const safePostTitle = escapeHtml(postTitle);
  const safeQueueUrl = escapeHtml(queueUrl);
  const excerpt =
    postExcerpt.length > 200
      ? escapeHtml(postExcerpt.slice(0, 200)) + "…"
      : escapeHtml(postExcerpt);

  const pendingLabel =
    pendingCount === 1 ? "1 post pending" : `${pendingCount} posts pending`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>New post pending review</title>
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
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">New post waiting for review</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">A member has submitted a post for review. Approve or reject it from the admin panel.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Submission details</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b; width: 30%;">Author:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${safeAuthorName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Email:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d;">${safeAuthorEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Title:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0d0d0d; font-weight: 600;">${safePostTitle}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Excerpt</h2>
              <p style="margin: 0; padding: 14px 16px; background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 14px; color: #4b4b4b;">${excerpt}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="padding: 12px 16px; background-color: #f0f3ff; border: 1px solid #d8deff; border-radius: 10px;">
                <p style="margin: 0; font-size: 13px; color: #33417a;"><strong style="color: #33417a;">${pendingLabel} in queue.</strong> Review older submissions first to keep the queue moving.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <a href="${safeQueueUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d0d0d; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Review in admin →</a>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">Automated admin notification from ${siteConfig.title}. Do not forward this email.</p>
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