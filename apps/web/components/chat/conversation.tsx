"use client";

import { ChatThread } from "@/components/chat/chat-thread";
import { OfferPanel } from "@/components/offers/offer-panel";
import type { ChatCopy } from "@/lib/copy/chat";
import type { DealsCopy } from "@/lib/copy/deals";

/**
 * A conversation that pairs the negotiated offer with the real-time chat, so an
 * introduction can turn into a versioned offer in one place.
 */
export function Conversation({
  conversationId,
  dealId,
  role,
  chatCopy,
  dealsCopy,
}: {
  conversationId: string;
  dealId: string;
  role: "creator" | "brand";
  chatCopy: ChatCopy;
  dealsCopy: DealsCopy;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <OfferPanel dealId={dealId} copy={dealsCopy} role={role} />
      <ChatThread conversationId={conversationId} copy={chatCopy} />
    </div>
  );
}
