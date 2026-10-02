"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/shared/Toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}