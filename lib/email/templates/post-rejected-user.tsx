import { siteConfig } from "@/content/config";
import { escapeHtml } from "@/lib/email/escape";

// Suggested subject: Update on your submission: "{postTitle}"
type PostRejectedUserProps = {
  authorName: string;
  postTitle: string;
  rejectionNote: string;
  editUrl: string;
};

export default function PostRejectedUserTemplate({
  authorName,
  postTitle,
  rejectionNote,
  editUrl,
}: PostRejectedUserProps) {
  const safeAuthorName = escapeHtml(authorName);
  const safePostTitle = escapeHtml(postTitle);
  const safeRejectionNote = escapeHtml(rejectionNote);
  const safeEditUrl = escapeHtml(editUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Update on your submission</title>
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
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #0d0d0d; letter-spacing: -0.02em;">Your submission needs changes</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #0d0d0d;">Hi ${safeAuthorName},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4b4b4b;">Thanks for submitting a post. After review, it isn't ready to publish yet. Here's why:</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="padding: 16px; background-color: #fef2f2; border-left: 3px solid #ef4444; border-radius: 6px;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.05em;">Reviewer note</p>
                <p style="margin: 0; font-size: 14px; color: #4b4b4b; white-space: pre-wrap;">${safeRejectionNote}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.05em;">Submission</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0d0d0d;">${safePostTitle}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px 28px;">
              <a href="${safeEditUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d0d0d; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Edit & resubmit →</a>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #8a8a8a;">Make the requested changes in your dashboard and submit again. If you believe this was a mistake, reply to this email.</p>
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