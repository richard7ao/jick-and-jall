/**
 * Required-configuration check for both machines.
 *
 * This validates that expected environment variables are *present* and
 * well-formed. It never reads, prints, or returns their values — only key
 * names and a pass/fail status — so it is safe to run in any log context.
 */

export type EnvRule = {
  /** Environment variable name. */
  readonly key: string;
  /** When true, a missing value is an error; otherwise it is a warning. */
  readonly required: boolean;
  /** Optional shape check applied only when a value is present. */
  readonly validate?: (value: string) => boolean;
  /** Human-readable expectation, used in redacted output only. */
  readonly expectation: string;
};

export const ENV_RULES: readonly EnvRule[] = [
  {
    key: "JJ_AGENT_ID",
    required: true,
    validate: (v) => v === "agent-1" || v === "agent-2",
    expectation: 'exactly "agent-1" or "agent-2"',
  },
  { key: "SUPERLINKED_BASE_URL", required: true, validate: isHttpUrl, expectation: "http(s) URL" },
  { key: "SUPERLINKED_API_KEY", required: true, expectation: "non-empty" },
  { key: "ELEVENLABS_API_KEY", required: false, expectation: "non-empty (voice QA only)" },
  { key: "FIREBASE_PROJECT_ID", required: true, expectation: "non-empty" },
  {
    key: "STRIPE_SECRET_KEY",
    required: true,
    validate: (v) => v.startsWith("sk_test_"),
    expectation: 'test-mode key ("sk_test_…")',
  },
  { key: "RESEND_API_KEY", required: true, expectation: "non-empty" },
  { key: "GOOGLE_OAUTH_CLIENT_ID", required: true, expectation: "non-empty" },
  { key: "GOOGLE_OAUTH_CLIENT_SECRET", required: true, expectation: "non-empty" },
];

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type EnvKeyStatus = "ok" | "missing" | "invalid";

export type EnvKeyResult = {
  readonly key: string;
  readonly required: boolean;
  readonly status: EnvKeyStatus;
  readonly expectation: string;
};

export type EnvReport = {
  readonly ok: boolean;
  readonly results: readonly EnvKeyResult[];
};

/** Pure environment check. Returns statuses only — never any value. */
export function checkEnv(env: Record<string, string | undefined>): EnvReport {
  const results = ENV_RULES.map((rule): EnvKeyResult => {
    const value = env[rule.key];
    let status: EnvKeyStatus;
    if (value === undefined || value === "") {
      status = "missing";
    } else if (rule.validate && !rule.validate(value)) {
      status = "invalid";
    } else {
      status = "ok";
    }
    return { key: rule.key, required: rule.required, status, expectation: rule.expectation };
  });

  const ok = results.every((r) => r.status === "ok" || (!r.required && r.status === "missing"));
  return { ok, results };
}

/** Render a report with no secret values, one line per key. */
export function formatEnvReport(report: EnvReport): string {
  const lines = report.results.map((r) => {
    const mark = r.status === "ok" ? "PASS" : r.required ? "FAIL" : "WARN";
    const detail = r.status === "ok" ? "" : ` (${r.status}; expected ${r.expectation})`;
    return `  [${mark}] ${r.key}${detail}`;
  });
  return [`env check: ${report.ok ? "ok" : "failed"}`, ...lines].join("\n");
}

async function main(): Promise<void> {
  const report = checkEnv(process.env);
  console.log(formatEnvReport(report));
  if (!report.ok) process.exit(1);
}

// Run only when invoked directly, never on import (keeps tests side-effect free).
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
