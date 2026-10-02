"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import UserMenu from "@/components/layout/UserMenu";

export default function NavUserArea() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-20 animate-pulse rounded-md bg-muted/20"
      />
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-token hover:border-accent hover:text-accent"
      >
        Sign in
      </Link>
    );
  }

  return (
    <UserMenu
      name={user.name ?? null}
      email={user.email ?? ""}
      image={user.image ?? null}
      role={user.role}
      username={user.username ?? null}
    />
  );
}