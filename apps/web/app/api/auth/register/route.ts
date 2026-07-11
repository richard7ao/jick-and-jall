import { getRepositories } from "@jj/db";

import { deriveUid, json, startSession } from "@/lib/server/api";

interface RegisterBody {
  email?: string;
  role?: string;
  locale?: string;
  invitationCode?: string;
}

export async function POST(request: Request): Promise<Response> {
  // Enumeration-safe: always a neutral response shape.
  try {
    const b = (await request.json()) as RegisterBody;
    const roleOk = b.role === "creator" || b.role === "brand";
    const localeOk = b.locale === "en" || b.locale === "es";
    if (roleOk && localeOk && b.email) {
      const uid = deriveUid(b.email);
      await getRepositories().users.create({
        uid,
        email: b.email,
        role: b.role as "creator" | "brand",
        locale: b.locale as "en" | "es",
      });
      await startSession({
        uid,
        role: b.role as "creator" | "brand",
        locale: b.locale as "en" | "es",
      });
      return json({ ok: true, role: b.role }, 201);
    }
  } catch {
    /* neutral */
  }
  return json({ ok: true }, 200);
}
