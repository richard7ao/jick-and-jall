import { z } from "zod";
import { createHttpClient, type HttpClientConfig } from "./http.js";

/**
 * Typed ElevenLabs client for Jick voice onboarding. Tokens are scoped to a
 * single uid; upstream recordings can be deleted so retention/deletion
 * propagates. Response bodies are validated and never echoed on error.
 */
const TokenResponse = z.object({ token: z.string().min(1), expiresAt: z.string().min(1) });
const DeleteResponse = z.object({ deleted: z.boolean() });

export function createElevenLabsClient(config: HttpClientConfig) {
  const http = createHttpClient("elevenlabs", config);

  return {
    baseUrl: http.baseUrl,

    async issueConversationToken(uid: string): Promise<{ token: string; expiresAt: string }> {
      return http.request(
        "convai/conversation/token",
        { method: "POST", body: JSON.stringify({ scope: { uid } }) },
        TokenResponse,
      );
    },

    async deleteConversation(conversationId: string): Promise<boolean> {
      const result = await http.request(
        `convai/conversations/${encodeURIComponent(conversationId)}`,
        { method: "DELETE" },
        DeleteResponse,
      );
      return result.deleted;
    },
  };
}
