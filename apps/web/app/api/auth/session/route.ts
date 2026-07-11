import { clearSessionCookie, readSessionCookie, verifyCsrfToken } from "@jj/auth";
import type { NextRequest } from "next/server";

/**
 * Session revocation. Clearing is CSRF-protected (double-submit) so a malicious
 * site cannot log a user out; the response expires the HTTP-only cookie.
 */
export const runtime = "nodejs";

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

export function csrfOk(request: Request): boolean {
  const header = request.headers.get("x-csrf-token");
  const cookie = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)csrf=([^;]+)/.exec(cookie);
  return verifyCsrfToken(header, match ? decodeURIComponent(match[1]!) : undefined);
}

export async function handleRevokeSession(request: Request): Promise<Response> {
  if (!csrfOk(request)) return json(403, { error: "csrf" });
  const had = Boolean(readSessionCookie(request.headers.get("cookie")));
  return json(200, { revoked: had }, { "set-cookie": clearSessionCookie() });
}

export async function DELETE(request: NextRequest): Promise<Response> {
  return handleRevokeSession(request);
}
