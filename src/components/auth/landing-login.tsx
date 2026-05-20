"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Handshake, ThumbsUp, Sparkles } from "lucide-react";
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
    title: "Co-create with CGI",
    description:
      "Clients bring the domain; CGI brings the craft—everyone drops AI plays into one living backlog, not a forgotten slide deck.",
  },
  {
    icon: ThumbsUp,
    title: "Make priorities visible",
    description:
      "Vote, re-vote, or step back—signals stay honest so the next workshop starts where the last one actually left off.",
  },
  {
    icon: Sparkles,
    title: "Stories for steering groups",
    description:
      "See what resonated, who leaned in, and which ideas earned momentum—ready-made narrative for sponsors and delivery teams.",
  },
];

export function LandingLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ok = login(email);
    if (!ok) {
      toast({
        title: "Sign in failed",
        description:
          "Use the business email your CGI team shared for this program, or type Admin for facilitator access.",
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
            CGI × client co-innovation
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight xs:text-4xl md:text-5xl lg:text-6xl"
          >
            Where bold AI ideas meet{" "}
            <span className="text-gradient">shared delivery</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-xl text-lg text-muted md:text-xl lg:mx-0 mx-auto"
          >
            Invite your customers into the same arena as CGI practitioners—capture
            use cases, pressure-test impact, and leave every working session with a
            ranked backlog everyone actually believes in.
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
              <h2 className="text-xl font-bold tracking-tight">Step into your program space</h2>
              <p className="mt-2 text-sm text-muted">
                Sign in with the business email your CGI engagement lead shared—or type{" "}
                <span className="font-medium text-foreground">Admin</span> if you are facilitating the session for
                clients and CGI teams.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business email or Admin</Label>
                  <motion.div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      id="email"
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="you@client.com or you@cgi.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </motion.div>
                  <p className="text-[11px] leading-relaxed text-muted">
                    Privacy: your email is used only to attribute submissions, votes,
                    and comments inside this arena for the duration of the CGI-led
                    program. It is not used for unsolicited marketing, is not sold to
                    third parties, and is kept only as long as the initiative requires.
                    For access or deletion requests, contact your CGI programme owner
                    or your organisation&apos;s data protection contact named in the
                    engagement letter.
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
