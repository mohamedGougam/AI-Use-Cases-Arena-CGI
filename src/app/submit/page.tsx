"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/hooks/use-toast";
import {
  DEPARTMENTS,
  CATEGORIES,
  IMPACT_LEVELS,
  EFFORT_LEVELS,
  type Department,
} from "@/lib/constants";
import { SCORE_POINTS } from "@/lib/participants";
import type { ImpactLevel, EffortLevel, UseCaseCategory } from "@/types";
import { CONFETTI_COLORS } from "@/lib/brand-colors";

export default function SubmitPage() {
  const router = useRouter();
  const { submitUseCase, currentUser } = useApp();
  const { isAdmin, isReady } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    businessProblem: "",
    proposedSolution: "",
    department: "" as "" | Department,
    impact: "" as ImpactLevel | "",
    effort: "" as EffortLevel | "",
    category: "" as UseCaseCategory | "",
    tags: "",
  });

  useEffect(() => {
    if (isReady && isAdmin) {
      router.replace("/");
    }
  }, [isReady, isAdmin, router]);

  if (!isReady || isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.description ||
      !form.department ||
      !form.impact ||
      !form.effort ||
      !form.category
    ) {
      toast({ title: "Missing fields", description: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    submitUseCase({
      title: form.title,
      description: form.description,
      businessProblem: form.businessProblem,
      proposedSolution: form.proposedSolution,
      department: form.department as Department,
      impact: form.impact as ImpactLevel,
      effort: form.effort as EffortLevel,
      category: form.category as UseCaseCategory,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      submitterName: currentUser.name,
    });

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: [...CONFETTI_COLORS] });

    toast({
      title: `+${SCORE_POINTS.submit} points`,
      description: "Your use case is live and linked to your email.",
    });

    setLoading(false);
    setTimeout(() => router.push("/gallery"), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Submit a Use Case"
        subtitle="Your idea is saved under your login email. You earn points when others vote."
        icon={PlusCircle}
      />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card space-y-6 p-8"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI-Powered Contract Review" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief overview of the use case" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessProblem">Business Problem</Label>
          <Textarea id="businessProblem" value={form.businessProblem} onChange={(e) => setForm({ ...form, businessProblem: e.target.value })} placeholder="What challenge does this solve?" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedSolution">Proposed AI Solution</Label>
          <Textarea id="proposedSolution" value={form.proposedSolution} onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })} placeholder="How would AI address this?" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select
              value={form.department}
              onValueChange={(v) => setForm({ ...form, department: v as Department })}
            >
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as UseCaseCategory })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expected Impact *</Label>
            <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v as ImpactLevel })}>
              <SelectTrigger><SelectValue placeholder="Impact level" /></SelectTrigger>
              <SelectContent>
                {IMPACT_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Effort *</Label>
            <Select value={form.effort} onValueChange={(v) => setForm({ ...form, effort: v as EffortLevel })}>
              <SelectTrigger><SelectValue placeholder="Effort level" /></SelectTrigger>
              <SelectContent>
                {EFFORT_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="NLP, Automation, Quick Win" />
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit to Arena"}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}
