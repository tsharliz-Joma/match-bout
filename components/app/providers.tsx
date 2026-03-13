"use client";

import { SessionProvider } from "next-auth/react";
import { ToasterProvider } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ToasterProvider />
    </SessionProvider>
  );
}
