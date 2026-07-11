import { createHttpClient, type HttpClientConfig } from "@jj/voice";
import { z } from "zod";

/**
 * Typed Superlinked client — the primary generation/embedding provider. Uses
 * the shared HTTP boundary (/v1 normalization, bearer auth, bounded retry,
 * redacted errors, schema validation).
 */
const EmbeddingResponse = z.object({ embedding: z.array(z.number()) });
const GenerationResponse = z.object({ text: z.string() });

export function createSuperlinkedClient(config: HttpClientConfig) {
  const http = createHttpClient("superlinked", config);

  return {
    baseUrl: http.baseUrl,

    async embed(text: string): Promise<number[]> {
      const result = await http.request(
        "embeddings",
        { method: "POST", body: JSON.stringify({ input: text }) },
        EmbeddingResponse,
      );
      return result.embedding;
    },

    async generate(prompt: string): Promise<string> {
      const result = await http.request(
        "generate",
        { method: "POST", body: JSON.stringify({ prompt }) },
        GenerationResponse,
      );
      return result.text;
    },
  };
}
