import { decideMediaAccess, ownerFromRecordingPath, type Principal } from "@jj/auth";
import { getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import type { NextRequest } from "next/server";
import { getServerPrincipal } from "../../../lib/server-auth";

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

function storageBucket() {
  const app = getApps()[0] ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-jj" });
  return getStorage(app).bucket(process.env.FIREBASE_STORAGE_BUCKET ?? "demo-jj.appspot.com");
}

export async function GET(request: NextRequest): Promise<Response> {
  const principal = await getServerPrincipal(request);
  const admins = new Set((process.env.ADMIN_UIDS ?? "").split(",").filter(Boolean));
  return handleMediaRequest(request, {
    getPrincipal: () => principal,
    admins,
    exists: async (path) => (await storageBucket().file(path).exists())[0],
    signUrl: async (path) => {
      const [url] = await storageBucket()
        .file(path)
        .getSignedUrl({ action: "read", expires: Date.now() + 5 * 60_000 });
      return url;
    },
  });
}
