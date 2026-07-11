import { providerFetch } from "./provider-http.js";

/**
 * Minimal ElevenLabs Conversational-AI client for Jick/Jall voice onboarding.
 * Only the operations v1 needs are exposed; recordings are deletable so upstream
 * deletion can propagate when a user removes a session.
 */
export interface ElevenLabsConfig {
  baseUrl?: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface ConversationToken {
  token: string;
  conversationId: string;
}

export class ElevenLabsClient {
  private readonly baseUrl: string;

  constructor(private readonly config: ElevenLabsConfig) {
    this.baseUrl = config.baseUrl ?? "https://api.elevenlabs.io";
  }

  /** Issue a scoped, short-lived token for a client voice session. */
  async createConversationToken(agentId: string): Promise<ConversationToken> {
    return providerFetch<ConversationToken>("elevenlabs", {
      baseUrl: this.baseUrl,
      apiKey: this.config.apiKey,
      path: "/convai/conversation/token",
      method: "POST",
      body: { agent_id: agentId },
      ...(this.config.fetchImpl ? { fetchImpl: this.config.fetchImpl } : {}),
    });
  }

  /** Propagate deletion of a recording to ElevenLabs. */
  async deleteConversation(conversationId: string): Promise<void> {
    await providerFetch<unknown>("elevenlabs", {
      baseUrl: this.baseUrl,
      apiKey: this.config.apiKey,
      path: `/convai/conversations/${conversationId}`,
      method: "DELETE",
      ...(this.config.fetchImpl ? { fetchImpl: this.config.fetchImpl } : {}),
    });
  }
}
