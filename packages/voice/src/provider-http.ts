/**
 * Shared, deterministic helpers for calling external providers safely.
 * TypeScript owns retries and error handling; provider bodies are never
 * surfaced to callers or logs.
 */

/** Ensure the base URL targets the `/v1` API surface exactly once, no trailing slash. */
export function normalizeBaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return /\/v1$/.test(trimmed) ? trimmed : `${trimmed}/v1`;
}

/**
 * Parse a Retry-After header (seconds) into milliseconds, clamped to [0, max].
 * Missing/invalid values yield 0 so callers fall back to their own backoff.
 */
export function boundedRetryAfterMs(
  header: string | null | undefined,
  maxMs = 10_000,
): number {
  const seconds = Number(header);
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(Math.round(seconds * 1000), maxMs);
}

export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
  ) {
    // Redacted: only the provider name and status, never the response body.
    super(`${provider} request failed (${status})`);
    this.name = "ProviderError";
  }
}

export interface ProviderRequest {
  baseUrl: string;
  apiKey: string;
  path: string;
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  fetchImpl?: typeof fetch;
}

/** Host-bound bearer request returning parsed JSON, with redacted errors. */
export async function providerFetch<T>(
  provider: string,
  request: ProviderRequest,
): Promise<T> {
  const doFetch = request.fetchImpl ?? fetch;
  const url = `${normalizeBaseUrl(request.baseUrl)}${request.path}`;
  const response = await doFetch(url, {
    method: request.method ?? "GET",
    headers: {
      authorization: `Bearer ${request.apiKey}`,
      "content-type": "application/json",
    },
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  });
  if (!response.ok) throw new ProviderError(provider, response.status);
  return (await response.json()) as T;
}
