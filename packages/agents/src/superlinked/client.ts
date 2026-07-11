import { providerFetch } from "@jj/voice";

/**
 * Superlinked client — the primary generation/embedding provider. It supplies
 * semantic signals only; the deterministic ranking in ./matching owns the
 * final order. (Hermes is developer-side and never called from production.)
 */
export interface SuperlinkedConfig {
  baseUrl?: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface SemanticCandidate {
  creatorUid: string;
  semanticScore: number;
}

export class SuperlinkedClient {
  private readonly baseUrl: string;

  constructor(private readonly config: SuperlinkedConfig) {
    this.baseUrl = config.baseUrl ?? "https://api.superlinked.com";
  }

  /** Semantic similarity of published creators for a brief query. */
  async queryCreators(query: string, limit = 25): Promise<SemanticCandidate[]> {
    const result = await providerFetch<{ results: SemanticCandidate[] }>(
      "superlinked",
      {
        baseUrl: this.baseUrl,
        apiKey: this.config.apiKey,
        path: "/search/creators",
        method: "POST",
        body: { query, limit },
        ...(this.config.fetchImpl ? { fetchImpl: this.config.fetchImpl } : {}),
      },
    );
    return result.results;
  }
}
