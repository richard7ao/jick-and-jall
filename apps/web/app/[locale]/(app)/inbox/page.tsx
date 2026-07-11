import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Inbox } from "@/components/chat/inbox";
import { isLocale } from "@/lib/i18n";
import { getChatCopy } from "@/lib/copy/chat";

export default async function InboxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getChatCopy(locale);
  return (
    <Container className="flex flex-col gap-6 py-10">
      <h1 className="font-display text-3xl font-black">{copy.inboxTitle}</h1>
      <Inbox locale={locale} copy={copy} />
    </Container>
  );
}
