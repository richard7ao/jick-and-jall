import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/60">
        <Container className="flex h-16 items-center">
          <Link
            href={`/${locale}`}
            className="font-display text-lg font-extrabold tracking-[-0.02em]"
          >
            Jick <span className="text-primary">&amp;</span> Jall
          </Link>
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
