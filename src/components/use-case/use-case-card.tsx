"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";
import type { UseCase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { VoteButton } from "./vote-button";
import { formatRelativeDate } from "@/lib/utils";

interface UseCaseCardProps {
  useCase: UseCase;
  index?: number;
}

export function UseCaseCard({ useCase, index = 0 }: UseCaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/use-cases/${useCase.id}`}>
        <article className="glass-card-hover flex gap-4 p-5">
          <VoteButton useCaseId={useCase.id} votes={useCase.votes} compact />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-bold leading-tight hover:text-primary transition-colors">
                {useCase.title}
              </h3>
              <Badge variant="status">{useCase.status}</Badge>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted">{useCase.description}</p>
            <BadgeDisplay badges={useCase.badges} className="mb-3" />
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="rounded-md bg-secondary/30 px-2 py-0.5">{useCase.department}</span>
              <span>{useCase.category}</span>
              <span>Impact: {useCase.impact}</span>
              <span>Effort: {useCase.effort}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {useCase.comments.length}
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Sparkles className="h-3 w-3" />
                Score {useCase.innovationScore}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted">
                by {useCase.submitter} · {formatRelativeDate(useCase.createdAt)}
              </span>
              <div className="flex flex-wrap gap-1">
                {useCase.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
