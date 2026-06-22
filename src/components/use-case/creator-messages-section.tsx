"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import type { UseCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import {
  getDisplayNameFromEmail,
  isSameIdentity,
  normalizeEmail,
  resolveUseCaseCreatorEmail,
} from "@/lib/auth";
import { formatRelativeDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CreatorMessagesSectionProps {
  useCase: UseCase;
}

export function CreatorMessagesSection({ useCase: initialUseCase }: CreatorMessagesSectionProps) {
  const { addCreatorMessage, useCases } = useApp();
  const { email, canAccessArchitectTools } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const useCase = useCases.find((uc) => uc.id === initialUseCase.id) ?? initialUseCase;

  const creatorEmail = resolveUseCaseCreatorEmail(useCase);
  const viewerEmail = email ? normalizeEmail(email) : "";
  const isCreator = Boolean(creatorEmail && isSameIdentity(viewerEmail, creatorEmail));
  const canSend = Boolean(email && creatorEmail && !isCreator);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text || sending) return;

    setSending(true);
    const ok = addCreatorMessage(useCase.id, text);
    setSending(false);

    if (ok) {
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Only the use case creator can read this.",
      });
      return;
    }

    toast({
      title: "Could not send message",
      description: !creatorEmail
        ? "This use case has no identifiable creator."
        : isCreator
          ? "You cannot message yourself on your own use case."
          : "Please try again.",
      variant: "destructive",
    });
  };

  if (!creatorEmail && !canAccessArchitectTools) return null;

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
        {canAccessArchitectTools && !isCreator && " As facilitator or architect, you can read all messages below."}
      </p>

      {(isCreator || canAccessArchitectTools) && (
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
                <p className="mb-2 text-xs text-muted">{getDisplayNameFromEmail(m.fromEmail)}</p>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {canSend && (
        <>
          <Textarea
            aria-label="Private message to creator"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <Button type="button" onClick={handleSend} disabled={sending || !messageText.trim()}>
            {sending ? "Sending..." : "Send to creator"}
          </Button>
        </>
      )}
    </section>
  );
}
