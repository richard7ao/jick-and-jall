import { createHash } from "node:crypto";

import { cookies } from "next/headers";

import {
  AuthorizationError,
  SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@jj/auth";
import type { Locale, Role } from "@jj/shared";

const SECRET = process.env.SESSION_SECRET ?? "dev-insecure-secret";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, SECRET);
}

export async function startSession(input: {
  uid: string;
  role: Role;
  locale: Locale;
}): Promise<void> {
  const token = createSessionToken(input, SECRET);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Deterministic uid from an email. In production Firebase Auth mints the uid;
 * this keeps identity stable across requests until that integration lands.
 */
export function deriveUid(email: string): string {
  return `u_${createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 24)}`;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function fail(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function handleError(error: unknown): Response {
  if (error instanceof AuthorizationError) return fail(error.status, error.message);
  if (error instanceof Error && error.name === "ZodError") {
    return fail(400, "invalid request");
  }
  return fail(500, "internal error");
}
