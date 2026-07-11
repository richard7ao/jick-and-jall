/**
 * Session cookie primitives. The actual Firebase ID-token exchange happens
 * server-side in T3; here we own the cookie contract: name, secure attributes,
 * serialization, and parsing. Cookies are HTTP-only and SameSite=Lax.
 */

export const SESSION_COOKIE_NAME = "__session";

export type SessionCookieOptions = {
  readonly maxAgeSeconds: number;
  readonly secure?: boolean;
};

export function serializeSessionCookie(value: string, options: SessionCookieOptions): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
  ];
  if (options.secure ?? true) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function parseCookies(header: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index === -1) continue;
    const key = pair.slice(0, index).trim();
    if (key) out[key] = decodeURIComponent(pair.slice(index + 1).trim());
  }
  return out;
}

export function readSessionCookie(header: string | null | undefined): string | undefined {
  return parseCookies(header)[SESSION_COOKIE_NAME];
}
