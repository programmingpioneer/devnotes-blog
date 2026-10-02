import { siteConfig } from "@/content/config";
import { escapeHtml } from "@/lib/email/escape";

// Suggested subject: Your post is now live: "{postTitle}"
type PostApprovedUserProps = {
  authorName: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
};

export default function PostApprovedUserTemplate({
  authorName,
  postTitle,
  postExcerpt,
  postUrl,
}: PostApprovedUserProps) {
  const safeAuthorName = escapeHtml(authorName);
  const safePostTitle = escapeHtml(postTitle);
  const safePostUrl = escapeHtml(postUrl);
  const safeExcerpt = escapeHtml(postExcerpt);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Your post is live</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Your post is live 🎉</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Hi ${safeAuthorName},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">Good news — your submission has been approved and is now published on ${siteConfig.title}.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">Published</p>
                <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #0d0d0d;">${safePostTitle}</p>
                <p style="margin: 0; font-size: 14px; color: #4b4b4b;">${safeExcerpt}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <a href="${safePostUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d0d0d; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">View live post →</a>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">Thanks for contributing to ${siteConfig.title}. Share your post with your network to help it reach readers.</p>
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