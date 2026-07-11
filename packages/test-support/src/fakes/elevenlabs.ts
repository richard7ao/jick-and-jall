/**
 * Deterministic ElevenLabs voice fake. Issues predictable session tokens and
 * canned transcripts so voice onboarding logic can be tested without audio
 * hardware or the live provider.
 */

import type { Locale } from "@jj/shared";

export type FakeTranscriptTurn = { readonly role: "agent" | "user"; readonly text: string };

export class FakeElevenLabs {
  private counter = 0;

  /** Scoped, non-secret session token bound to a uid (deterministic). */
  async issueToken(uid: string): Promise<string> {
    this.counter += 1;
    return `fake-voice-token:${uid}:${this.counter}`;
  }

  /** A short canned bilingual transcript for the given locale. */
  async transcript(locale: Locale): Promise<FakeTranscriptTurn[]> {
    const greeting = locale === "es" ? "Hola, cuéntame sobre ti." : "Hi, tell me about yourself.";
    const reply = locale === "es" ? "Soy creador de contenido de viajes." : "I make travel content.";
    return [
      { role: "agent", text: greeting },
      { role: "user", text: reply },
    ];
  }
}
