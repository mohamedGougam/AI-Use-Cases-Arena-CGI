"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import type { UseCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { normalizeEmail } from "@/lib/auth";
import { formatRelativeDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CreatorMessagesSectionProps {
  useCase: UseCase;
}

export function CreatorMessagesSection({ useCase }: CreatorMessagesSectionProps) {
  const { addCreatorMessage } = useApp();
  const { email, isAdmin } = useAuth();
  const [messageText, setMessageText] = useState("");

  const creatorEmail = normalizeEmail(useCase.submitterEmail || "");
  const viewerEmail = email ? normalizeEmail(email) : "";
  const isCreator = Boolean(creatorEmail && viewerEmail === creatorEmail);
  const canSend = Boolean(email && creatorEmail && !isCreator);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const ok = addCreatorMessage(useCase.id, messageText.trim());
    if (ok) {
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Only the use case creator can read this.",
      });
    } else {
      toast({
        title: "Could not send message",
        description: "You cannot message yourself on your own use case.",
        variant: "destructive",
      });
    }
  };

  if (!creatorEmail && !isAdmin) return null;

  return (
    <section className="glass-card border border-secondary/30 p-6">
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold">
        <Mail className="h-5 w-5 text-secondary" />
        {isCreator ? "Messages for you" : "Message for the creator"}
      </h2>
      <p className="mb-6 text-sm text-muted">
        {isCreator
          ? "Private feedback from colleagues on this use case. Not shown in public discussion."
          : "Send a private note to the person who submitted this idea (e.g. request more detail). Only they can see it."}
        {isAdmin && !isCreator && " As admin, you can read all messages below."}
      </p>

      {(isCreator || isAdmin) && (
        <div className="mb-6 space-y-3">
          {useCase.creatorMessages.length === 0 ? (
            <p className="text-sm text-muted">
              {isCreator ? "No messages yet." : "No creator messages on this use case."}
            </p>
          ) : (
            useCase.creatorMessages.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-border/15 bg-secondary/10 p-4"
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{m.fromName}</span>
                  <span className="text-xs text-muted">{formatRelativeDate(m.createdAt)}</span>
                </div>
                <p className="text-xs text-muted mb-2">{m.fromEmail}</p>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {canSend && (
        <>
          <Textarea
            placeholder="e.g. This is great — can you please add more description on the expected ROI?"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <Button onClick={handleSend}>Send to creator</Button>
        </>
      )}
    </section>
  );
}
