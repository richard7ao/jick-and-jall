import { createResendProvider, invitationEmail, type EmailProvider } from "@jj/email";
import {
  SCHEMA_VERSION,
  type Invitation,
  type Locale,
  type Role,
  type WaitlistEntry,
} from "@jj/shared";
import { invitationsRepository, waitlistRepository } from "@jj/db";
import type { NextRequest } from "next/server";

/**
 * Admin-only waitlist approval: creates a single-use invitation, emails it, and
 * marks the entry approved. Guarded by a shared admin token in v1 (full role
 * auth lands in T3). Email failures do not lose the invitation.
 */
export const runtime = "nodejs";

export const INVITATION_TTL_DAYS = 7;

export type ApproveDeps = {
  isAuthorized: (request: Request) => boolean;
  getEntry: (entryId: string) => Promise<WaitlistEntry | null>;
  createInvitation: (invitation: Invitation) => Promise<Invitation>;
  approveEntry: (entryId: string, at: string) => Promise<void>;
  sendEmail: (email: { to: string; locale: Locale; template: string; message: { subject: string; text: string } }) => Promise<{ delivered: boolean }>;
  now: () => string;
  newInvitationId: () => string;
  inviteUrl: (invitationId: string, locale: Locale) => string;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export function buildInvitation(entry: WaitlistEntry, id: string, now: string): Invitation {
  const expiresAt = new Date(Date.parse(now) + INVITATION_TTL_DAYS * 86_400_000).toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id,
    email: entry.email,
    role: entry.role as Role,
    expiresAt,
    consumedAt: null,
  };
}

export async function handleApproveInvitation(request: Request, deps: ApproveDeps): Promise<Response> {
  if (!deps.isAuthorized(request)) return json(403, { error: "forbidden" });

  let body: { entryId?: string };
  try {
    body = (await request.json()) as { entryId?: string };
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.entryId) return json(400, { error: "invalid_input" });

  const entry = await deps.getEntry(body.entryId);
  if (!entry) return json(404, { error: "not_found" });

  const now = deps.now();
  const invitation = buildInvitation(entry, deps.newInvitationId(), now);
  await deps.createInvitation(invitation);

  let emailDelivered = true;
  try {
    await deps.sendEmail({
      to: entry.email,
      locale: entry.locale,
      template: "invitation",
      message: invitationEmail(entry.locale, {
        inviteUrl: deps.inviteUrl(invitation.id, entry.locale),
        role: entry.role as Role,
      }),
    });
  } catch {
    // Invitation persists; delivery is retryable and reported for follow-up.
    emailDelivered = false;
  }

  await deps.approveEntry(entry.id, now);
  return json(200, { invitationId: invitation.id, emailDelivered });
}

function adminAuthorized(request: Request): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export async function POST(request: NextRequest): Promise<Response> {
  const waitlist = waitlistRepository();
  const invitations = invitationsRepository();
  const apiKey = process.env.RESEND_API_KEY;
  const provider: EmailProvider | null = apiKey
    ? createResendProvider(apiKey, process.env.EMAIL_FROM ?? "no-reply@jickandjall.example")
    : null;
  const origin = process.env.APP_ORIGIN ?? "https://app.example.com";

  return handleApproveInvitation(request, {
    isAuthorized: adminAuthorized,
    getEntry: (id) => waitlist.get(id),
    createInvitation: (invitation) => invitations.create(invitation),
    approveEntry: (id, at) => waitlist.setStatus(id, "approved", at),
    sendEmail: async (email) => {
      if (!provider) return { delivered: false };
      return provider.send({ to: email.to, locale: email.locale, template: email.template, message: email.message });
    },
    now: () => new Date().toISOString(),
    newInvitationId: () => crypto.randomUUID(),
    inviteUrl: (id, locale) => `${origin}/${locale}/invite/${id}`,
  });
}
