import { createHash } from "node:crypto";
import { CONSENT_POLICY_VERSION, SCHEMA_VERSION, WaitlistSubmissionSchema, type WaitlistEntry } from "@jj/shared";
import { normalizeEmail, waitlistRepository } from "@jj/db";
import type { NextRequest } from "next/server";

/**
 * Public waitlist submission. Responses are enumeration-safe (always the same
 * shape) so an attacker cannot tell whether an email already exists.
 */
export const runtime = "nodejs";

export type WaitlistDeps = {
  submit: (entry: WaitlistEntry) => Promise<{ entryId: string; created: boolean }>;
  now: () => string;
  idempotencyKey: () => string;
};

/** Deterministic entry id derived from identity + idempotency key. */
export function idempotencyId(email: string, role: string, key: string): string {
  return createHash("sha256").update(`${normalizeEmail(email)}|${role}|${key}`).digest("hex").slice(0, 32);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function handleWaitlistSubmit(request: Request, deps: WaitlistDeps): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  // Normalize email before validation so callers may send untrimmed input.
  if (body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string") {
    (body as { email: string }).email = normalizeEmail((body as { email: string }).email);
  }

  const parsed = WaitlistSubmissionSchema.safeParse(body);
  if (!parsed.success) return json(400, { error: "invalid_input" });
  if (parsed.data.consent.policyVersion !== CONSENT_POLICY_VERSION) {
    return json(400, { error: "invalid_input" });
  }

  const key = request.headers.get("idempotency-key") ?? deps.idempotencyKey();
  const now = deps.now();
  const entry: WaitlistEntry = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: idempotencyId(parsed.data.email, parsed.data.role, key),
    role: parsed.data.role,
    email: normalizeEmail(parsed.data.email),
    locale: parsed.data.locale,
    consent: parsed.data.consent,
    status: "pending",
    ...(parsed.data.qualification ? { qualification: parsed.data.qualification } : {}),
  };

  await deps.submit(entry);
  return json(200, { status: "ok" });
}

export async function POST(request: NextRequest): Promise<Response> {
  const repo = waitlistRepository();
  return handleWaitlistSubmit(request, {
    submit: (entry) => repo.submit(entry),
    now: () => new Date().toISOString(),
    idempotencyKey: () => crypto.randomUUID(),
  });
}
