import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Double-submit CSRF primitives. Tokens are opaque, high-entropy strings
 * compared in constant time so verification does not leak timing information.
 */

export function generateCsrfToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function verifyCsrfToken(provided: string | undefined | null, expected: string | undefined | null): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
