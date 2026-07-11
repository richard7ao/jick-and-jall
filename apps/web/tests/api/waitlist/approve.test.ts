// @vitest-environment node
import { CONSENT_POLICY_VERSION, SCHEMA_VERSION, type Invitation, type WaitlistEntry } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleApproveInvitation, buildInvitation, type ApproveDeps } from "../../../app/api/admin/invitations/route";

const entry: WaitlistEntry = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
  id: "entry-1",
  role: "creator",
  email: "person@example.com",
  locale: "es",
  consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
  status: "pending",
};

function makeDeps(overrides: Partial<ApproveDeps> = {}) {
  const created: Invitation[] = [];
  const emails: { to: string; locale: string }[] = [];
  const approved: string[] = [];
  const deps: ApproveDeps = {
    isAuthorized: () => true,
    getEntry: async (id) => (id === entry.id ? entry : null),
    createInvitation: async (invitation) => {
      created.push(invitation);
      return invitation;
    },
    approveEntry: async (id) => {
      approved.push(id);
    },
    sendEmail: async (email) => {
      emails.push({ to: email.to, locale: email.locale });
      return { delivered: true };
    },
    now: () => "2026-07-11T00:00:00.000Z",
    newInvitationId: () => "inv-1",
    inviteUrl: (id, locale) => `https://app/${locale}/invite/${id}`,
    ...overrides,
  };
  return { deps, created, emails, approved };
}

function request(body: unknown): Request {
  return new Request("http://localhost/api/admin/invitations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/invitations", () => {
  it("rejects unauthorized callers", async () => {
    const { deps } = makeDeps({ isAuthorized: () => false });
    expect((await handleApproveInvitation(request({ entryId: "entry-1" }), deps)).status).toBe(403);
  });

  it("creates an invitation, emails it, and approves the entry", async () => {
    const { deps, created, emails, approved } = makeDeps();
    const res = await handleApproveInvitation(request({ entryId: "entry-1" }), deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ invitationId: "inv-1", emailDelivered: true });
    expect(created[0]?.email).toBe("person@example.com");
    expect(emails[0]?.locale).toBe("es");
    expect(approved).toEqual(["entry-1"]);
  });

  it("keeps the invitation even if email delivery fails", async () => {
    const { deps, created } = makeDeps({
      sendEmail: async () => {
        throw new Error("smtp down");
      },
    });
    const res = await handleApproveInvitation(request({ entryId: "entry-1" }), deps);
    expect(await res.json()).toEqual({ invitationId: "inv-1", emailDelivered: false });
    expect(created).toHaveLength(1);
  });

  it("404s for an unknown entry", async () => {
    const { deps } = makeDeps();
    expect((await handleApproveInvitation(request({ entryId: "nope" }), deps)).status).toBe(404);
  });

  it("builds a 7-day, single-use invitation", () => {
    const inv = buildInvitation(entry, "inv-1", "2026-07-11T00:00:00.000Z");
    expect(inv.consumedAt).toBeNull();
    expect(inv.expiresAt).toBe("2026-07-18T00:00:00.000Z");
  });
});
