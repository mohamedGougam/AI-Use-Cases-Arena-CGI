"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";
import { toast } from "@/hooks/use-toast";

interface VoteButtonProps {
  useCaseId: string;
  votes: number;
  compact?: boolean;
}

export function VoteButton({ useCaseId, votes, compact }: VoteButtonProps) {
  const { voteOnUseCase, hasVoted } = useApp();
  const voted = hasVoted(useCaseId);
  const [displayVotes, setDisplayVotes] = useState(votes);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setDisplayVotes(votes);
  }, [votes]);

  const handleVote = () => {
    if (voted) {
      toast({ title: "Already voted", description: "You can only vote once per use case." });
      return;
    }
    const success = voteOnUseCase(useCaseId);
    if (success) {
      setDisplayVotes((v) => v + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      toast({
        title: "+5 XP earned!",
        description: "Thanks for supporting this idea.",
      });
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVote();
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border transition-all",
        compact ? "px-2 py-1.5 min-w-[48px]" : "px-3 py-2 min-w-[56px]",
        voted
          ? "border-primary/50 bg-primary/20 text-primary shadow-glow-sm"
          : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/10"
      )}
    >
      <motion.div animate={animating ? { y: -4, scale: 1.2 } : { y: 0, scale: 1 }}>
        <ChevronUp className={cn("h-5 w-5", voted && "text-primary")} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayVotes}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold"
        >
          {displayVotes}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
