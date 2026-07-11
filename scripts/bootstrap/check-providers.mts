/**
 * `bootstrap:check` entrypoint.
 *
 * Runs the required-config check and, when `--require-live` is set, performs
 * bounded connectivity probes against each provider. Probes assert only that a
 * host responds; they never send secrets in URLs, never read response bodies,
 * and print status-only lines passed through the redaction boundary.
 *
 * Usage: node check-providers.mts [--require-live] [--redact]
 */

import { checkEnv, formatEnvReport } from "./check-env.mts";
import { redactSensitive } from "./redact.ts";

const PROBE_TIMEOUT_MS = 5_000;

type Fetcher = typeof fetch;

export type ProbeResult = {
  readonly name: string;
  readonly ok: boolean;
  /** Short status note; carries no secret and no response body. */
  readonly note: string;
};

/** Reachability probe: bounded, body-free, records only HTTP status class. */
async function probeUrl(name: string, url: string | undefined, fetcher: Fetcher): Promise<ProbeResult> {
  if (!url) return { name, ok: false, note: "skipped: no URL configured" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetcher(url, { method: "GET", signal: controller.signal });
    // Any HTTP response (even 401/404) proves reachability; we do not read the body.
    return { name, ok: true, note: `reachable (HTTP ${response.status})` };
  } catch (error) {
    const reason = error instanceof Error ? error.name : "unknown error";
    return { name, ok: false, note: `unreachable (${reason})` };
  } finally {
    clearTimeout(timer);
  }
}

export async function runProviderProbes(
  env: Record<string, string | undefined>,
  fetcher: Fetcher = fetch,
): Promise<readonly ProbeResult[]> {
  return Promise.all([probeUrl("superlinked", env.SUPERLINKED_BASE_URL, fetcher)]);
}

function parseFlags(argv: readonly string[]) {
  return {
    requireLive: argv.includes("--require-live"),
    redact: argv.includes("--redact"),
  };
}

function printLine(redact: boolean, value: unknown): void {
  console.log(redact ? redactSensitive(value) : value);
}

/** Load `.env` into process.env when present, using Node's native loader. */
function loadDotEnv(): void {
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env file: rely on the ambient environment (e.g. CI secrets).
  }
}

async function main(): Promise<void> {
  const { requireLive, redact } = parseFlags(process.argv.slice(2));
  loadDotEnv();

  const envReport = checkEnv(process.env);
  console.log(formatEnvReport(envReport));

  let liveOk = true;
  if (requireLive) {
    const probes = await runProviderProbes(process.env);
    for (const probe of probes) {
      printLine(redact, `  [${probe.ok ? "PASS" : "FAIL"}] ${probe.name}: ${probe.note}`);
    }
    liveOk = probes.every((p) => p.ok);
  }

  if (!envReport.ok || (requireLive && !liveOk)) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
