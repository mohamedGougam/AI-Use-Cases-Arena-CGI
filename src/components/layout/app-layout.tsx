"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navigation } from "./navigation";
import { useAuth } from "@/context/auth-context";

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 bg-background lg:gap-6 xl:gap-8">
      <Navigation />
      <main className="min-w-0 flex-1">
        <div className="shell-padding mx-auto w-full min-w-0 max-w-[min(100%,2200px)] overflow-x-hidden">
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
