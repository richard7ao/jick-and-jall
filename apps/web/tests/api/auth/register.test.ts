// @vitest-environment node
import { SCHEMA_VERSION, type Invitation, type UserRecord } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleRegister, type RegisterDeps } from "../../../app/api/auth/register/route";

const now = "2026-07-11T00:00:00.000Z";
const invitation: Invitation = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  id: "inv-1",
  email: "invitee@example.com",
  role: "creator",
  expiresAt: "2999-01-01T00:00:00.000Z",
  consumedAt: null,
};

function makeDeps(overrides: Partial<RegisterDeps> = {}) {
  const users: UserRecord[] = [];
  const consumed: string[] = [];
  const deps: RegisterDeps = {
    verifyCsrf: () => true,
    verifyIdToken: async () => ({ uid: "uid-1", email: "invitee@example.com" }),
    getInvitation: async (id) => (id === invitation.id ? { ...invitation } : null),
    createUser: async (u) => {
      users.push(u);
      return u;
    },
    consumeInvitation: async (id) => {
      consumed.push(id);
      return { ...invitation, consumedAt: now };
    },
    createSessionCookie: async () => ({ value: "sess", maxAgeSeconds: 3600, expiresAt: now }),
    now: () => now,
    ...overrides,
  };
  return { deps, users, consumed };
}

function req(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ok = { invitationId: "inv-1", idToken: "tok", locale: "es" };

describe("POST /api/auth/register", () => {
  it("registers an invited user with the invitation's role and sets a session cookie", async () => {
    const { deps, users, consumed } = makeDeps();
    const res = await handleRegister(req(ok), deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ uid: "uid-1", role: "creator" });
    expect(res.headers.get("set-cookie")).toContain("__session=sess");
    expect(users[0]?.role).toBe("creator");
    expect(users[0]?.locale).toBe("es");
    expect(consumed).toEqual(["inv-1"]);
  });

  it("rejects CSRF failures and invalid tokens", async () => {
    expect((await handleRegister(req(ok), makeDeps({ verifyCsrf: () => false }).deps)).status).toBe(403);
    expect(
      (await handleRegister(req(ok), makeDeps({ verifyIdToken: async () => { throw new Error("bad"); } }).deps)).status,
    ).toBe(401);
  });

  it("enforces invited-email equality", async () => {
    const { deps } = makeDeps({ verifyIdToken: async () => ({ uid: "uid-1", email: "someone-else@example.com" }) });
    expect((await handleRegister(req(ok), deps)).status).toBe(403);
  });

  it("rejects unknown, consumed, and expired invitations", async () => {
    expect((await handleRegister(req({ ...ok, invitationId: "nope" }), makeDeps().deps)).status).toBe(404);
    expect(
      (await handleRegister(req(ok), makeDeps({ getInvitation: async () => ({ ...invitation, consumedAt: now }) }).deps)).status,
    ).toBe(409);
    expect(
      (await handleRegister(req(ok), makeDeps({ getInvitation: async () => ({ ...invitation, expiresAt: "2000-01-01T00:00:00.000Z" }) }).deps)).status,
    ).toBe(410);
  });
});
