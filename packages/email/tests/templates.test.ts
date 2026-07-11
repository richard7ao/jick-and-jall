import { describe, expect, it } from "vitest";
import { invitationEmail, waitlistConfirmationEmail } from "@jj/email";

describe("bilingual email templates", () => {
  it("localizes the invitation subject and role and includes the link", () => {
    const en = invitationEmail("en", { inviteUrl: "https://x/y", role: "creator" });
    const es = invitationEmail("es", { inviteUrl: "https://x/y", role: "creator" });
    expect(en.subject).toContain("invitation");
    expect(en.text).toContain("creator");
    expect(en.text).toContain("https://x/y");
    expect(es.subject).toContain("invitación");
    expect(es.text).toContain("creador");
    expect(es.text).toContain("https://x/y");
  });

  it("provides both languages for waitlist confirmation", () => {
    expect(waitlistConfirmationEmail("en").subject).toContain("waitlist");
    expect(waitlistConfirmationEmail("es").subject).toContain("espera");
  });
});
