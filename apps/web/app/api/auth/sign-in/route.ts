import { getRepositories } from "@jj/db";

import { fail, json, startSession } from "@/lib/server/api";

interface SignInBody {
  email?: string;
}

export async function POST(request: Request): Promise<Response> {
  const b = (await request.json().catch(() => ({}))) as SignInBody;
  // Single, enumeration-safe error for any failure.
  const invalid = fail(401, "invalid credentials");
  if (!b.email) return invalid;

  const user = await getRepositories().users.getByEmail(b.email);
  if (!user) return invalid;

  await startSession({ uid: user.uid, role: user.role, locale: user.locale });
  return json({ role: user.role });
}
