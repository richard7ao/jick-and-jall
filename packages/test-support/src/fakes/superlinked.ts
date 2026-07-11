/**
 * Deterministic Superlinked fake for unit tests. Embeddings and generations are
 * derived purely from the input so tests never touch the network and remain
 * reproducible. This is a test double only — production uses the real provider.
 */

export class FakeSuperlinked {
  /** Stable pseudo-embedding: small fixed-length vector derived from the text. */
  async embed(text: string, dimensions = 8): Promise<number[]> {
    const vector: number[] = [];
    for (let i = 0; i < dimensions; i += 1) {
      let hash = i + 1;
      for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
      vector.push(hash / 1000);
    }
    return vector;
  }

  /** Deterministic short "generation" that echoes a normalized prompt digest. */
  async generate(prompt: string): Promise<string> {
    const normalized = prompt.trim().replace(/\s+/g, " ");
    return `fake-generation:${normalized.length}`;
  }
}

/** Cosine similarity helper for asserting deterministic ranking in tests. */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const dot = a.reduce((sum, value, i) => sum + value * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return magA === 0 || magB === 0 ? 0 : dot / (magA * magB);
}
