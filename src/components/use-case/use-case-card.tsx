"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { UseCase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./vote-button";
import { formatRelativeDate } from "@/lib/utils";
import { UseCaseDateBadge } from "./use-case-date-badge";

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
      className="min-w-0"
    >
      <Link href={`/use-cases/${useCase.id}`} className="block min-w-0">
        <article className="glass-card-hover flex min-w-0 flex-col gap-3 p-4 xs:flex-row xs:gap-4 sm:p-5">
          <div className="flex shrink-0 xs:block">
            <VoteButton useCaseId={useCase.id} votes={useCase.votes} compact />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <h3 className="min-w-0 text-base font-bold leading-tight break-words hover:text-primary transition-colors sm:text-lg">
                {useCase.title}
              </h3>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <UseCaseDateBadge createdAt={useCase.createdAt} />
                <Badge variant="status">{useCase.status}</Badge>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted">{useCase.description}</p>
            {useCase.votes >= 5 && (
              <Badge variant="secondary" className="mb-2">
                Popular · {useCase.votes} votes
              </Badge>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="rounded-md bg-secondary/30 px-2 py-0.5">{useCase.department}</span>
              <span className="hidden xs:inline">{useCase.category}</span>
              <span>Impact: {useCase.impact}</span>
              <span className="hidden sm:inline">Effort: {useCase.effort}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {useCase.comments.length}
              </span>
              <span className="font-medium text-primary">{useCase.votes} votes</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 truncate text-xs text-muted" title={useCase.submitterEmail || useCase.submitter}>
                by {useCase.submitterEmail || useCase.submitter} ·{" "}
                {formatRelativeDate(useCase.createdAt)}
              </span>
              <div className="flex min-w-0 flex-wrap gap-1">
                {useCase.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full surface-muted px-2 py-0.5 text-xs"
                  >
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
