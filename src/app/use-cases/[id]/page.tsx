"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Bot,
  Lightbulb,
  Copy,
  Target,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { VoteButton } from "@/components/use-case/vote-button";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UseCaseCard } from "@/components/use-case/use-case-card";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { XP_REWARDS } from "@/lib/constants";

export default function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { useCases, addComment } = useApp();
  const [commentText, setCommentText] = useState("");

  const useCase = useCases.find((uc) => uc.id === id);

  if (!useCase) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-lg font-medium">Use case not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/gallery">Back to gallery</Link>
        </Button>
      </div>
    );
  }

  const similar = useCases
    .filter((uc) => uc.id !== id && (uc.category === useCase.category || uc.department === useCase.department))
    .sort((a, b) => b.innovationScore - a.innovationScore)
    .slice(0, 3);

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(id, commentText.trim());
    setCommentText("");
    toast({
      title: `+${XP_REWARDS.addComment} XP earned!`,
      description: "Your comment has been posted.",
    });
  };

  const aiSummary = `This use case proposes leveraging AI to address "${useCase.businessProblem.slice(0, 80)}..." through ${useCase.proposedSolution.slice(0, 100)}... With ${useCase.impact} impact and ${useCase.effort} effort, it scores ${useCase.innovationScore} on the innovation index.`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href="/gallery" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to gallery
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <BadgeDisplay badges={useCase.badges} className="mb-3" />
            <h1 className="text-3xl font-bold">{useCase.title}</h1>
            <p className="mt-2 text-muted">{useCase.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{useCase.department}</Badge>
              <Badge variant="outline">{useCase.category}</Badge>
              <Badge variant="status">{useCase.status}</Badge>
            </div>
          </div>
          <VoteButton useCaseId={useCase.id} votes={useCase.votes} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-primary/10 p-4 text-center glow-border">
            <Sparkles className="mx-auto h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{useCase.innovationScore}</p>
            <p className="text-xs text-muted">Innovation Score</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">#{useCases.sort((a, b) => b.innovationScore - a.innovationScore).findIndex((uc) => uc.id === id) + 1}</p>
            <p className="text-xs text-muted">Arena Rank</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{useCase.impact}</p>
            <p className="text-xs text-muted">Impact · {useCase.effort} Effort</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Business Problem</h2>
            <p className="text-muted">{useCase.businessProblem}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">Proposed AI Solution</h2>
            <p className="text-muted">{useCase.proposedSolution}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">Expected Value</h2>
            <p className="text-muted">
              {useCase.impact} business impact with {useCase.effort} implementation effort.
              Submitted by {useCase.submitter} on {formatDate(useCase.createdAt)}.
            </p>
          </section>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {useCase.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs">#{tag}</span>
          ))}
        </div>
      </motion.article>

      <div className="glass-card p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-bold">AI-Generated Summary</h2>
          <Badge variant="outline" className="text-xs">Placeholder</Badge>
        </div>
        <p className="text-sm text-muted">{aiSummary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Lightbulb, label: "Similar Use Cases", desc: "AI detection coming soon" },
          { icon: Copy, label: "Duplicate Detection", desc: "Compare against portfolio" },
          { icon: Target, label: "Impact Estimation", desc: "ML-based ROI forecast" },
          { icon: Bot, label: "Suggested Next Steps", desc: "Automated recommendations" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4 opacity-70">
            <item.icon className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="glass-card p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-primary" />
          Discussion ({useCase.comments.length})
        </h2>
        <div className="space-y-4 mb-6">
          {useCase.comments.length === 0 ? (
            <p className="text-sm text-muted">No comments yet. Start the discussion!</p>
          ) : (
            useCase.comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.userName}</span>
                  <span className="text-xs text-muted">{formatRelativeDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-muted">{c.text}</p>
              </div>
            ))
          )}
        </div>
        <Textarea
          placeholder="Add your thoughts..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="mb-3"
        />
        <Button onClick={handleComment}>Post Comment</Button>
      </section>

      {similar.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Similar Use Cases</h2>
          <div className="space-y-4">
            {similar.map((uc, i) => (
              <UseCaseCard key={uc.id} useCase={uc} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
