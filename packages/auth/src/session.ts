import { createHmac, timingSafeEqual } from "node:crypto";

import { LocaleSchema, RoleSchema, type Locale, type Role } from "@jj/shared";
import { z } from "zod";

/**
 * Stateless session tokens: a base64url JSON payload with an HMAC-SHA256
 * signature. TypeScript owns authorization; the token only carries identity
 * (uid, immutable role, locale) and an expiry. In production the uid is minted
 * by Firebase Auth; here the signing secret gates issuance and verification.
 */

export const SESSION_COOKIE = "jj_session";

export const SessionPayloadSchema = z
  .object({
    uid: z.string().min(1),
    role: RoleSchema,
    locale: LocaleSchema,
    exp: z.number().int().positive(),
  })
  .strict();
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(
  input: { uid: string; role: Role; locale: Locale },
  secret: string,
  ttlSeconds = 60 * 60 * 24 * 14,
  nowMs: number = Date.now(),
): string {
  const payload: SessionPayload = {
    uid: input.uid,
    role: input.role,
    locale: input.locale,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  nowMs: number = Date.now(),
): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const parsed = SessionPayloadSchema.safeParse(
    JSON.parse(Buffer.from(body, "base64url").toString("utf8")),
  );
  if (!parsed.success) return null;
  if (parsed.data.exp * 1000 <= nowMs) return null;
  return parsed.data;
}
