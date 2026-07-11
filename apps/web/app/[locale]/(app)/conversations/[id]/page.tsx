import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { ChatThread } from "@/components/chat/chat-thread";
import { isLocale } from "@/lib/i18n";
import { getChatCopy } from "@/lib/copy/chat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getChatCopy(locale);
  return (
    <Container className="flex min-h-dvh flex-col py-10">
      <ChatThread conversationId={id} copy={copy} />
    </Container>
  );
}
