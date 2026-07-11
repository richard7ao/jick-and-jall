import type { Principal } from "@jj/auth";
import { creatorProfilesRepository } from "@jj/db";
import { CreatorProfileSchema, SCHEMA_VERSION, type CreatorProfile } from "@jj/shared";
import type { NextRequest } from "next/server";
import { getServerPrincipal } from "../../../../lib/server-auth";

/**
 * Creator profile API. A creator reads and edits only their own profile; the
 * server stamps uid/timestamps so the client cannot spoof ownership.
 */
export const runtime = "nodejs";

export type ProfileDeps = {
  getPrincipal: (request: Request) => Principal | null;
  get: (uid: string) => Promise<CreatorProfile | null>;
  upsert: (profile: CreatorProfile) => Promise<CreatorProfile>;
  now: () => string;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function handleGetProfile(request: Request, deps: ProfileDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal || principal.role !== "creator") return json(403, { error: "forbidden" });
  const profile = await deps.get(principal.uid);
  return profile ? json(200, profile) : json(404, { error: "not_found" });
}

export async function handlePutProfile(request: Request, deps: ProfileDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal || principal.role !== "creator") return json(403, { error: "forbidden" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const now = deps.now();
  const existing = await deps.get(principal.uid);
  const candidate = {
    ...body,
    schemaVersion: SCHEMA_VERSION,
    uid: principal.uid, // server-owned; never trust client uid
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const parsed = CreatorProfileSchema.safeParse(candidate);
  if (!parsed.success) return json(400, { error: "invalid_input" });
  const saved = await deps.upsert(parsed.data);
  return json(200, saved);
}

function wire(principal: Principal | null): ProfileDeps {
  const repo = creatorProfilesRepository();
  return {
    getPrincipal: () => principal,
    get: (uid) => repo.get(uid),
    upsert: (profile) => repo.upsert(profile),
    now: () => new Date().toISOString(),
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  return handleGetProfile(request, wire(await getServerPrincipal(request)));
}

export async function PUT(request: NextRequest): Promise<Response> {
  return handlePutProfile(request, wire(await getServerPrincipal(request)));
}
