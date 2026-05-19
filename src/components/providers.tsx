"use client";

import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="ai-arena-theme"
      themes={["light", "dark"]}
    >
      <AuthProvider>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
