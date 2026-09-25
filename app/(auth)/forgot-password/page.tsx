"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import FormField from "@/components/auth/FormField";
import { useToast } from "@/components/shared/Toast";

function KeyIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Something went wrong.", "error");
        return;
      }

      setSent(true);
      toast(data.message, "success");
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="We sent a password reset link to your email."
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full border border-green-500/30 bg-green-500/5 p-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <p className="text-sm text-muted">
            Link sent to{" "}
            <strong className="text-foreground">{email}</strong>. Expires in 1
            hour.
          </p>
          <p className="mt-3 text-sm text-muted">
            Didn&apos;t get it? Check spam, or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-accent hover:underline"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="mt-6 block w-full rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={{
        text: "Remembered it?",
        linkText: "Back to sign in",
        href: "/login",
      }}
    >
      <div className="mb-6 flex justify-center">
        <div className="rounded-full border border-border bg-muted/5 p-3">
          <KeyIcon />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}