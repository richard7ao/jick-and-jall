import { describe, expect, it } from "vitest";
import { checkEnv, formatEnvReport } from "./check-env.mts";

const validEnv: Record<string, string> = {
  JJ_AGENT_ID: "agent-2",
  SUPERLINKED_BASE_URL: "https://host.example.com:8080",
  SUPERLINKED_API_KEY: "SL-xxxx",
  FIREBASE_PROJECT_ID: "demo-jj",
  STRIPE_SECRET_KEY: "sk_test_xxxx",
  RESEND_API_KEY: "re_xxxx",
  GOOGLE_OAUTH_CLIENT_ID: "id",
  GOOGLE_OAUTH_CLIENT_SECRET: "secret",
};

function statusOf(env: Record<string, string | undefined>, key: string) {
  return checkEnv(env).results.find((r) => r.key === key)?.status;
}

describe("checkEnv", () => {
  it("passes when all required keys are present and well-formed", () => {
    expect(checkEnv(validEnv).ok).toBe(true);
  });

  it("treats a missing optional key as a non-blocking warning", () => {
    const report = checkEnv(validEnv);
    expect(report.ok).toBe(true);
    expect(statusOf(validEnv, "ELEVENLABS_API_KEY")).toBe("missing");
  });

  it("fails when a required key is missing", () => {
    const { RESEND_API_KEY, ...rest } = validEnv;
    void RESEND_API_KEY;
    expect(checkEnv(rest).ok).toBe(false);
    expect(statusOf(rest, "RESEND_API_KEY")).toBe("missing");
  });

  it("rejects a non-test Stripe key", () => {
    const env = { ...validEnv, STRIPE_SECRET_KEY: "sk_live_danger" };
    expect(checkEnv(env).ok).toBe(false);
    expect(statusOf(env, "STRIPE_SECRET_KEY")).toBe("invalid");
  });

  it("rejects an invalid agent id and a non-URL Superlinked base", () => {
    const env = { ...validEnv, JJ_AGENT_ID: "agent-3", SUPERLINKED_BASE_URL: "not a url" };
    expect(statusOf(env, "JJ_AGENT_ID")).toBe("invalid");
    expect(statusOf(env, "SUPERLINKED_BASE_URL")).toBe("invalid");
  });

  it("never includes secret values in rendered output", () => {
    const output = formatEnvReport(checkEnv(validEnv));
    expect(output).not.toContain("SL-xxxx");
    expect(output).not.toContain("sk_test_xxxx");
    expect(output).toContain("SUPERLINKED_API_KEY");
  });
});
