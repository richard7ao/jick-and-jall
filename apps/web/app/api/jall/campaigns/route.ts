import { randomUUID } from "node:crypto";
import type { Principal } from "@jj/auth";
import { campaignsRepository } from "@jj/db";
import { CampaignSchema, SCHEMA_VERSION, type Campaign } from "@jj/shared";
import type { NextRequest } from "next/server";
import { getServerPrincipal } from "../../../../lib/server-auth";

/**
 * Jall campaign API. A brand creates and lists only its own campaigns; the
 * server owns id, brandUid, and timestamps.
 */
export const runtime = "nodejs";

export type CampaignDeps = {
  getPrincipal: (request: Request) => Principal | null;
  create: (campaign: Campaign) => Promise<Campaign>;
  listByBrand: (brandUid: string) => Promise<Campaign[]>;
  now: () => string;
  newId: () => string;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function brand(request: Request, deps: CampaignDeps): Principal | null {
  const p = deps.getPrincipal(request);
  return p && p.role === "brand" ? p : null;
}

export async function handleListCampaigns(request: Request, deps: CampaignDeps): Promise<Response> {
  const principal = brand(request, deps);
  if (!principal) return json(403, { error: "forbidden" });
  return json(200, { campaigns: await deps.listByBrand(principal.uid) });
}

export async function handleCreateCampaign(request: Request, deps: CampaignDeps): Promise<Response> {
  const principal = brand(request, deps);
  if (!principal) return json(403, { error: "forbidden" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const now = deps.now();
  const candidate = {
    ...body,
    schemaVersion: SCHEMA_VERSION,
    id: deps.newId(),
    brandUid: principal.uid, // server-owned
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
  const parsed = CampaignSchema.safeParse(candidate);
  if (!parsed.success) return json(400, { error: "invalid_input" });
  return json(201, await deps.create(parsed.data));
}

function wire(principal: Principal | null): CampaignDeps {
  const repo = campaignsRepository();
  return {
    getPrincipal: () => principal,
    create: (campaign) => repo.create(campaign),
    listByBrand: (uid) => repo.listByBrand(uid),
    now: () => new Date().toISOString(),
    newId: () => randomUUID(),
  };
}

export async function POST(request: NextRequest): Promise<Response> {
  return handleCreateCampaign(request, wire(await getServerPrincipal(request)));
}

export async function GET(request: NextRequest): Promise<Response> {
  return handleListCampaigns(request, wire(await getServerPrincipal(request)));
}
