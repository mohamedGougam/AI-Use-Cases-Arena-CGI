"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { CreatorMessagesSection } from "@/components/use-case/creator-messages-section";
import { ArchitectWorkspace } from "@/components/architect/architect-workspace";
import { UseCaseDateBadge } from "@/components/use-case/use-case-date-badge";
import { VoteButton } from "@/components/use-case/vote-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UseCaseCard } from "@/components/use-case/use-case-card";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getDisplayNameFromEmail } from "@/lib/auth";
import { departmentsMatch, getDisplayDepartment } from "@/lib/constants";
import { SCORE_POINTS } from "@/lib/participants";

export default function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { useCases, addComment } = useApp();
  const { canAccessArchitectTools } = useAuth();
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
    .filter(
      (uc) =>
        uc.id !== id &&
        (uc.category === useCase.category || departmentsMatch(uc.department, useCase.department))
    )
    .sort((a, b) => b.innovationScore - a.innovationScore)
    .slice(0, 3);

  const handleComment = () => {
    if (!commentText.trim() || canAccessArchitectTools) return;
    addComment(id, commentText.trim());
    setCommentText("");
    toast({
      title: `+${SCORE_POINTS.comment} point`,
      description: "Your comment is linked to your session.",
    });
  };

  const summaryParts = [
    useCase.description,
    `${useCase.category} initiative with ${useCase.impact} impact and ${useCase.effort} implementation effort.`,
    `Innovation score: ${useCase.innovationScore}.`,
  ];
  if (useCase.businessProblem.trim()) {
    summaryParts.push(`Business problem: ${useCase.businessProblem}`);
  }
  if (useCase.proposedSolution.trim()) {
    summaryParts.push(`Proposed approach: ${useCase.proposedSolution}`);
  }
  const useCaseSummary = summaryParts.join(" ");

  const submitterLabel =
    useCase.submitter || getDisplayNameFromEmail(useCase.submitterEmail || useCase.submitterId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 xl:max-w-5xl 2xl:max-w-6xl xl:space-y-10">
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
            <h1 className="text-3xl font-bold">{useCase.title}</h1>
            {submitterLabel && (
              <p className="mt-1 text-sm text-primary">{submitterLabel}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UseCaseDateBadge createdAt={useCase.createdAt} />
              <span className="text-xs text-muted">
                Submitted {formatDate(useCase.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-muted">{useCase.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{getDisplayDepartment(useCase.department)}</Badge>
              <Badge variant="outline">{useCase.category}</Badge>
              <Badge variant="status">{useCase.status}</Badge>
            </div>
          </div>
          <VoteButton useCaseId={useCase.id} votes={useCase.votes} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-primary/10 p-4 text-center glow-border">
            <Sparkles className="mx-auto h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{useCase.votes}</p>
            <p className="text-xs text-muted">Votes</p>
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
          {useCase.businessProblem.trim() && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Business Problem</h2>
              <p className="text-muted">{useCase.businessProblem}</p>
            </section>
          )}
          {useCase.proposedSolution.trim() && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Proposed AI Solution</h2>
              <p className="text-muted">{useCase.proposedSolution}</p>
            </section>
          )}
          <section>
            <h2 className="text-lg font-semibold mb-2">Expected Value</h2>
            <p className="text-muted">
              {useCase.impact} business impact with {useCase.effort} implementation effort.
              Submitted by {submitterLabel} on{" "}
              {formatDate(useCase.createdAt)}.
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
        <h2 className="font-bold mb-3">Use Case Summary</h2>
        <p className="text-sm text-muted">{useCaseSummary}</p>
      </div>

      {canAccessArchitectTools && (
        <div className="glass-card p-6 border border-primary/20">
          <ArchitectWorkspace useCase={useCase} />
        </div>
      )}

      <CreatorMessagesSection useCase={useCase} />

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
        {!canAccessArchitectTools ? (
          <>
            <Textarea
              aria-label="Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mb-3"
            />
            <Button onClick={handleComment}>Post Comment</Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            Facilitators and AI Architects can vote and review activity but do not post public comments.
          </p>
        )}
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
