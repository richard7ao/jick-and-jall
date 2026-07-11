/**
 * Redaction boundary for bootstrap tooling.
 *
 * The bootstrap scripts probe live providers, so their output must never leak
 * secrets, provider response bodies, or credential-shaped strings into logs,
 * committed receipts, or coordination state. Everything printed by
 * `bootstrap:check` passes through `redactSensitive` first.
 */

export const REDACTED = "[REDACTED]";

/** Object keys whose values are always secret regardless of their shape. */
const SENSITIVE_KEY_PATTERN =
  /(secret|password|passwd|token|api[_-]?key|apikey|authorization|auth[_-]?token|private[_-]?key|credential|client[_-]?secret|webhook[_-]?secret)/i;

/**
 * Value patterns that look like credentials even when the surrounding key is
 * unknown (e.g. a raw provider body echoed into an error). Order does not
 * matter; any match redacts the whole string.
 */
const SENSITIVE_VALUE_PATTERNS: readonly RegExp[] = [
  /\bsk_(test|live)_[A-Za-z0-9]{8,}/, // Stripe secret keys
  /\bwhsec_[A-Za-z0-9]{8,}/, // Stripe webhook signing secret
  /\bre_[A-Za-z0-9_]{8,}/, // Resend API keys
  /\bSL-[A-Za-z0-9]{16,}/, // Superlinked API keys
  /\bGOCSPX-[A-Za-z0-9_-]{8,}/, // Google OAuth client secret
  /\bAIza[A-Za-z0-9_-]{20,}/, // Google API keys
  /\bBearer\s+[A-Za-z0-9._-]{8,}/i, // Authorization: Bearer tokens
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{4,}/, // JWTs
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, // PEM private keys
];

/** True when a bare string value looks like a credential. */
export function looksSensitive(value: string): boolean {
  return SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function redactString(value: string): string {
  return looksSensitive(value) ? REDACTED : value;
}

/**
 * Recursively redact secrets from an arbitrary value. Objects and arrays are
 * copied (never mutated); a key flagged as sensitive redacts its entire value
 * subtree, and any credential-shaped string is redacted wherever it appears.
 */
export function redactSensitive(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitive(child);
    }
    return out;
  }
  return value;
}
