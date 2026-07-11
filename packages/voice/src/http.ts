import type { ZodType } from "zod";

/**
 * Shared provider HTTP boundary: /v1 normalization, host-bound bearer auth,
 * bounded Retry-After handling, JSON-schema validation, and redacted errors
 * (status only, never the response body).
 */
export type HttpClientConfig = {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly maxRetryAfterMs?: number;
  readonly fetchImpl?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
};

export class ProviderError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
  ) {
    super(`${provider} request failed: ${status}`); // no body, no headers
    this.name = "ProviderError";
  }
}

function normalizeBase(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

export function createHttpClient(provider: string, config: HttpClientConfig) {
  const base = normalizeBase(config.baseUrl);
  const cap = config.maxRetryAfterMs ?? 2000;
  const doFetch = config.fetchImpl ?? fetch;
  const sleep = config.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  async function request<T>(path: string, init: RequestInit, schema: ZodType<T>): Promise<T> {
    const url = `${base}/v1/${path.replace(/^\/+/, "")}`;
    const headers = { Authorization: `Bearer ${config.apiKey}`, "content-type": "application/json", ...(init.headers ?? {}) };

    let response = await doFetch(url, { ...init, headers });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const waitMs = Math.min(Number.isFinite(retryAfter) ? retryAfter * 1000 : 0, cap);
      await sleep(waitMs);
      response = await doFetch(url, { ...init, headers });
    }
    if (!response.ok) throw new ProviderError(provider, response.status);
    return schema.parse(await response.json());
  }

  return { request, baseUrl: base };
}
