import { getRepositories } from "@jj/db";
import { CONSENT_POLICY_VERSION } from "@jj/shared";

import { json } from "@/lib/server/api";

interface WaitlistBody {
  role?: string;
  email?: string;
  consent?: boolean;
  locale?: string;
  handle?: string;
}

export async function POST(request: Request): Promise<Response> {
  // Enumeration-safe: the response is always a neutral 201, regardless of
  // whether the email was already on the list or validation failed.
  try {
    const body = (await request.json()) as WaitlistBody;
    const roleOk = body.role === "creator" || body.role === "brand";
    const localeOk = body.locale === "en" || body.locale === "es";
    if (roleOk && localeOk && body.consent === true && body.email) {
      await getRepositories().waitlist.add({
        role: body.role as "creator" | "brand",
        email: body.email,
        locale: body.locale as "en" | "es",
        consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
        ...(body.handle ? { qualification: { handle: body.handle } } : {}),
      });
    }
  } catch {
    /* swallow — never reveal validation/storage details on this endpoint */
  }
  return json({ ok: true }, 201);
}
