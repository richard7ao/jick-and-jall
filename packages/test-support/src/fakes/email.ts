/**
 * Deterministic in-memory email provider fake (stands in for Resend).
 *
 * Records every send so tests can assert bilingual content and recipients, and
 * supports failure injection so retry/durability behavior can be exercised.
 */

import type { Locale } from "@jj/shared";

export type SentEmail = {
  readonly to: string;
  readonly template: string;
  readonly locale: Locale;
};

export class FakeEmailProvider {
  readonly sent: SentEmail[] = [];
  private failuresRemaining = 0;

  /** Force the next `n` sends to throw, to test retryable delivery. */
  failNext(n: number): void {
    this.failuresRemaining = n;
  }

  async send(email: SentEmail): Promise<{ delivered: boolean }> {
    if (this.failuresRemaining > 0) {
      this.failuresRemaining -= 1;
      throw new Error("fake email delivery failure");
    }
    this.sent.push(email);
    return { delivered: true };
  }

  lastTo(to: string): SentEmail | undefined {
    return [...this.sent].reverse().find((email) => email.to === to);
  }

  reset(): void {
    this.sent.length = 0;
    this.failuresRemaining = 0;
  }
}
