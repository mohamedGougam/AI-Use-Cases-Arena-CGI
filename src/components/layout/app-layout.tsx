"use client";

import { Navigation } from "./navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="lg:pl-64">
        <div className="min-h-screen px-4 pb-12 pt-20 lg:px-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
