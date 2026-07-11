import { json } from "@/lib/server/api";

/** Always neutral: never reveal whether the account exists. */
export function POST(): Response {
  return json({ ok: true });
}
