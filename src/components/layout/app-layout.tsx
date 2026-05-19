"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navigation } from "./navigation";
import { useAuth } from "@/context/auth-context";

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-0 bg-background lg:gap-6">
      <Navigation />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full min-w-0 max-w-[1600px] overflow-x-hidden px-4 pb-10 pt-[4.25rem] sm:px-6 sm:pb-12 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isReady) return;
    if (pathname === "/login") {
      router.replace("/");
      return;
    }
    if (!isAuthenticated && !isHome) {
      router.replace("/");
    }
  }, [isReady, isAuthenticated, isHome, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
