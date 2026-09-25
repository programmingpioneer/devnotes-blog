"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import FormField from "@/components/auth/FormField";
import { useToast } from "@/components/shared/Toast";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const justVerified = params.get("verified") === "true";
  const justReset = params.get("reset") === "true";

  useEffect(() => {
    if (justVerified) toast("Email verified. You can sign in now.", "success");
    if (justReset) toast("Password reset. Sign in with your new password.", "success");
  }, [justVerified, justReset, toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setLoading(false);
      if (result?.error === "EMAIL_NOT_VERIFIED") {
        toast("Verify your email first. Check your inbox.", "error");
      } else {
        toast("Invalid email or password.", "error");
      }
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());
    const role = session?.user?.role;

    toast("Signed in successfully.", "success");
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Sign in to continue."
      footer={{
        text: "New here?",
        linkText: "Create an account",
        href: "/register",
      }}
    >
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

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-muted hover:text-foreground"
          >
            Forgot your password?
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}