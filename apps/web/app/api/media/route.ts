import { decideMediaAccess, ownerFromRecordingPath, type Principal } from "@jj/auth";
import type { NextRequest } from "next/server";

/**
 * Private media broker. Returns a short-lived signed URL to the owner (or an
 * admin) and an indistinguishable 404 for everyone else — denied and
 * not-found look identical, and raw Storage paths are never exposed.
 */
export const runtime = "nodejs";

export type MediaDeps = {
  getPrincipal: (request: Request) => Principal | null;
  admins: ReadonlySet<string>;
  exists: (path: string) => Promise<boolean>;
  signUrl: (path: string) => Promise<string>;
};

function notFound(): Response {
  return new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}

export async function handleMediaRequest(request: Request, deps: MediaDeps): Promise<Response> {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  const ownerUid = ownerFromRecordingPath(path);
  if (!ownerUid) return notFound();

  const principal = deps.getPrincipal(request);
  // Denied and missing are indistinguishable: same 404, no existence probing first.
  if (decideMediaAccess(principal, ownerUid, deps.admins) === "deny") return notFound();
  if (!(await deps.exists(path))) return notFound();

  const url = await deps.signUrl(path);
  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}

export async function GET(_request: NextRequest): Promise<Response> {
  // Wired to Firebase Storage signed URLs when the storage client lands; the
  // handler is unit-tested via dependency injection.
  return notFound();
}
