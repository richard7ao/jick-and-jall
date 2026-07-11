import type { Locale } from "@jj/shared";
import type { EmailMessage } from "./templates.js";

/**
 * Provider-agnostic email boundary. Route handlers depend on this interface;
 * production wires a Resend adapter, tests inject a fake. Delivery failures are
 * surfaced (thrown) so callers can persist a retryable notification.
 */
export type OutboundEmail = {
  readonly to: string;
  readonly locale: Locale;
  readonly template: string;
  readonly message: EmailMessage;
};

export interface EmailProvider {
  send(email: OutboundEmail): Promise<{ delivered: boolean }>;
}

/** Minimal Resend adapter using fetch (no SDK dependency). */
export function createResendProvider(apiKey: string, from: string): EmailProvider {
  return {
    async send(email: OutboundEmail): Promise<{ delivered: boolean }> {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email.to,
          subject: email.message.subject,
          text: email.message.text,
        }),
      });
      if (!response.ok) throw new Error(`email send failed with status ${response.status}`);
      return { delivered: true };
    },
  };
}
