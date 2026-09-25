import { requireAdmin } from "@/lib/auth/session";
import MediaUploader from "@/components/admin/MediaUploader";

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        <p className="mt-1 text-sm text-muted">
          Upload images to Cloudflare R2. Copy the URL to use in posts or
          your profile.
        </p>
      </div>

      <div className="max-w-2xl">
        <MediaUploader />
      </div>

      <div className="max-w-2xl rounded-xl border border-border bg-muted/5 p-4">
        <p className="text-xs text-muted">
          <strong className="font-medium">Note:</strong> This is an
          upload-only tool. Uploaded files appear under{" "}
          <code className="rounded bg-muted/20 px-1 py-0.5 text-[11px]">
            uploads/
          </code>{" "}
          in the R2 bucket. A full media library with listing and delete will
          be added in a future phase.
        </p>
      </div>
    </div>
  );
}