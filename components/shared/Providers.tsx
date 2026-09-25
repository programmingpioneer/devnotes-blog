"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/shared/Toast";

export default function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}