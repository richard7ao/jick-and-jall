import { normalizeEmail } from "@jj/db";
import { serializeSessionCookie } from "@jj/auth";
import { SCHEMA_VERSION, type Invitation, type Locale, type UserRecord } from "@jj/shared";
import type { NextRequest } from "next/server";

/**
 * Invitation-gated registration. The server verifies the Firebase ID token,
 * checks the invited email matches, creates the immutable-role user, consumes
 * the single-use invitation, and issues a server session cookie. Client role
 * and redirect params are never trusted.
 */
export const runtime = "nodejs";

export type DecodedToken = { uid: string; email: string };

export type RegisterDeps = {
  verifyCsrf: (request: Request) => boolean;
  verifyIdToken: (idToken: string) => Promise<DecodedToken>;
  getInvitation: (id: string) => Promise<Invitation | null>;
  createUser: (user: UserRecord) => Promise<UserRecord>;
  consumeInvitation: (id: string, at: string) => Promise<Invitation>;
  createSessionCookie: (idToken: string) => Promise<{ value: string; maxAgeSeconds: number; expiresAt: string }>;
  now: () => string;
};

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

export async function handleRegister(request: Request, deps: RegisterDeps): Promise<Response> {
  if (!deps.verifyCsrf(request)) return json(403, { error: "csrf" });

  let body: { invitationId?: string; idToken?: string; locale?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.invitationId || !body.idToken) return json(400, { error: "invalid_input" });
  const locale: Locale = body.locale === "es" ? "es" : "en";

  let decoded: DecodedToken;
  try {
    decoded = await deps.verifyIdToken(body.idToken);
  } catch {
    return json(401, { error: "invalid_token" });
  }

  const invitation = await deps.getInvitation(body.invitationId);
  if (!invitation) return json(404, { error: "not_found" });
  if (invitation.consumedAt) return json(409, { error: "already_used" });
  const now = deps.now();
  if (Date.parse(invitation.expiresAt) <= Date.parse(now)) return json(410, { error: "expired" });
  // Invited-email equality: the signed-in identity must match the invite.
  if (normalizeEmail(decoded.email) !== normalizeEmail(invitation.email)) return json(403, { error: "email_mismatch" });

  const user: UserRecord = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    uid: decoded.uid,
    email: normalizeEmail(invitation.email),
    role: invitation.role,
    locale,
  };
  await deps.createUser(user);
  await deps.consumeInvitation(invitation.id, now);

  const session = await deps.createSessionCookie(body.idToken);
  return json(
    200,
    { uid: user.uid, role: user.role },
    { "set-cookie": serializeSessionCookie(session.value, { maxAgeSeconds: session.maxAgeSeconds }) },
  );
}

export async function POST(_request: NextRequest): Promise<Response> {
  // Real wiring (firebase-admin auth verification + session cookie minting) is
  // added when the client auth UI lands; the handler above is fully unit-tested
  // through dependency injection.
  return json(501, { error: "not_implemented" });
}
