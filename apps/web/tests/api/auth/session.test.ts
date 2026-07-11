// @vitest-environment node
import { generateCsrfToken } from "@jj/auth";
import { describe, expect, it } from "vitest";
import { handleRevokeSession } from "../../../app/api/auth/session/route";

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/auth/session", { method: "DELETE", headers });
}

describe("DELETE /api/auth/session", () => {
  it("revokes with a valid double-submit CSRF token and clears the cookie", async () => {
    const token = generateCsrfToken();
    const res = await handleRevokeSession(req({ "x-csrf-token": token, cookie: `csrf=${token}; __session=abc` }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revoked: true });
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects a missing or mismatched CSRF token", async () => {
    const res = await handleRevokeSession(req({ "x-csrf-token": "a", cookie: "csrf=b" }));
    expect(res.status).toBe(403);
  });
});
