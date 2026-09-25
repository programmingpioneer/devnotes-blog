import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  if (email) {
    redirect(`/verify-code?email=${encodeURIComponent(email)}`);
  }

  redirect("/verify-code");
}