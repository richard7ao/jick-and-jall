import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Double-submit CSRF: the same random token is sent as both a cookie and a
 * header; a request is trusted only when they match. Mutating API routes must
 * call {@link assertCsrf}.
 */

export const CSRF_COOKIE = "jj_csrf";
export const CSRF_HEADER = "x-jj-csrf";

export function generateCsrfToken(): string {
  return randomBytes(24).toString("base64url");
}

export function csrfMatches(
  cookieToken: string | undefined | null,
  headerToken: string | undefined | null,
): boolean {
  if (!cookieToken || !headerToken) return false;
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  return a.length === b.length && timingSafeEqual(a, b);
}
