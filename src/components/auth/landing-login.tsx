"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Handshake, ThumbsUp, Sparkles } from "lucide-react";
import { LogoCgi } from "@/components/shared/logo-cgi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticlesBackground } from "@/components/shared/particles-background";
import { AboutThisTool } from "@/components/shared/about-this-tool";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/hooks/use-toast";

const highlights = [
  {
    icon: Handshake,
    title: "Telecom AI discovery",
    description:
      "CGI consultants and client SMEs move from raw ideas to assessed opportunities—readiness, architecture, and effort—in one workshop pipeline.",
  },
  {
    icon: ThumbsUp,
    title: "Prioritize with confidence",
    description:
      "Vote on ideas while AI Architects score readiness, estimate delivery, and surface gaps before investment decisions.",
  },
  {
    icon: Sparkles,
    title: "Executive portfolio view",
    description:
      "Portfolio Analysis, value vs effort matrices, and consensus estimates—ready for steering groups and KPN-scale programmes.",
  },
];

export function LandingLogin() {
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ok = login(loginInput);
    if (!ok) {
      toast({
        title: "Sign in failed",
        description:
          "Type Business (workshop participant), Admin (facilitator), or Architect (AI solutioning).",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ParticlesBackground />
      <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-3 py-14 sm:px-4 sm:py-16 lg:flex-row lg:items-center lg:gap-12 lg:px-6 lg:py-20 xl:gap-16"
      >
        <div className="mb-12 flex-1 text-center lg:mb-0 lg:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 inline-flex items-center justify-center rounded-2xl border border-border/80 bg-white px-5 py-3 shadow-sm dark:border-white/15 dark:bg-white/95"
          >
            <LogoCgi className="text-3xl sm:text-4xl" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-primary"
          >
            CGI × Telecom co-innovation
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight xs:text-4xl md:text-5xl lg:text-6xl"
          >
            Where telecom AI opportunities become{" "}
            <span className="text-gradient">delivery-ready decisions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-xl text-lg text-muted md:text-xl lg:mx-0 mx-auto"
          >
            CGI&apos;s AI Opportunity Discovery platform for telecom clients—capture ideas,
            assess readiness, recommend architecture, and estimate delivery in real time.
          </motion.p>
          <ul className="mt-8 grid gap-4 xs:grid-cols-2 sm:gap-6 lg:mt-10 lg:grid-cols-1 lg:gap-5">
            {highlights.map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex gap-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md shrink-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/15 bg-card/80 p-6 shadow-glow-sm backdrop-blur-xl sm:p-8 md:p-10">
            <div className="absolute inset-0 bg-hero-glow pointer-events-none" aria-hidden />

            <div className="relative z-10">
              <h2 className="text-xl font-bold tracking-tight">Join this engagement</h2>
              <p className="mt-2 text-sm text-muted">
                Choose your role for this workshop—type{" "}
                <span className="font-medium text-foreground">Business</span> (client participant),{" "}
                <span className="font-medium text-foreground">Admin</span> (CGI facilitator), or{" "}
                <span className="font-medium text-foreground">Architect</span> (CGI AI Architect).
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Role</Label>
                  <motion.div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      id="login"
                      type="text"
                      autoComplete="username"
                      placeholder="Business, Admin, or Architect"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </motion.div>
                  <p className="text-[11px] leading-relaxed text-muted">
                    Workshop access only. Activity in this CGI-hosted arena is attributed to your
                    selected role for the duration of the engagement—not used for marketing or sold
                    to third parties.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Opening the arena..." : "Enter the arena"}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AboutThisTool className="relative z-10 mx-auto mt-8 w-full max-w-3xl px-3 pb-10 sm:mt-10 sm:px-4" />
    </div>
  );
}
