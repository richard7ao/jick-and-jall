// @vitest-environment node
import { CONSENT_POLICY_VERSION, type WaitlistEntry } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleWaitlistSubmit, idempotencyId, type WaitlistDeps } from "../../../app/api/waitlist/route";

function makeDeps() {
  const saved: WaitlistEntry[] = [];
  const deps: WaitlistDeps = {
    submit: async (entry) => {
      const existing = saved.find((e) => e.id === entry.id);
      if (existing) return { entryId: entry.id, created: false };
      saved.push(entry);
      return { entryId: entry.id, created: true };
    },
    now: () => "2026-07-11T00:00:00.000Z",
    idempotencyKey: () => "fixed-key",
  };
  return { deps, saved };
}

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  role: "creator",
  email: "  Person@Example.COM ",
  locale: "es",
  consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
};

describe("POST /api/waitlist", () => {
  it("accepts a valid submission, normalizes email, and stores pending", async () => {
    const { deps, saved } = makeDeps();
    const res = await handleWaitlistSubmit(request(valid, { "idempotency-key": "k1" }), deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(saved[0]?.email).toBe("person@example.com");
    expect(saved[0]?.status).toBe("pending");
  });

  it("is idempotent for the same key + identity", async () => {
    const { deps, saved } = makeDeps();
    await handleWaitlistSubmit(request(valid, { "idempotency-key": "k1" }), deps);
    await handleWaitlistSubmit(request(valid, { "idempotency-key": "k1" }), deps);
    expect(saved).toHaveLength(1);
  });

  it("returns the same enumeration-safe body regardless of duplication", async () => {
    const { deps } = makeDeps();
    const a = await handleWaitlistSubmit(request(valid, { "idempotency-key": "k1" }), deps);
    const b = await handleWaitlistSubmit(request(valid, { "idempotency-key": "k1" }), deps);
    expect(await a.json()).toEqual(await b.json());
  });

  it("rejects invalid JSON, invalid input, and denied consent", async () => {
    const { deps } = makeDeps();
    expect((await handleWaitlistSubmit(request("{bad"), deps)).status).toBe(400);
    expect((await handleWaitlistSubmit(request({ role: "creator" }), deps)).status).toBe(400);
    expect(
      (await handleWaitlistSubmit(request({ ...valid, consent: { accepted: false, policyVersion: CONSENT_POLICY_VERSION } }), deps)).status,
    ).toBe(400);
  });

  it("derives a stable id from identity + key", () => {
    expect(idempotencyId("a@b.com", "creator", "k")).toBe(idempotencyId("A@B.com", "creator", "k"));
    expect(idempotencyId("a@b.com", "creator", "k")).not.toBe(idempotencyId("a@b.com", "brand", "k"));
  });
});
