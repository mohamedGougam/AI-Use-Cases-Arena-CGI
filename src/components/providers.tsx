"use client";

import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/app-context";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
