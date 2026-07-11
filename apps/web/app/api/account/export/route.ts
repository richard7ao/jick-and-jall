import type { Principal } from "@jj/auth";
import { creatorProfilesRepository, voiceSessionsRepository } from "@jj/db";
import type { CreatorProfile, VoiceSession } from "@jj/shared";
import type { NextRequest } from "next/server";
import { getServerPrincipal } from "../../../../lib/server-auth";

/**
 * GDPR-style data export: returns the requester's own profile plus voice-session
 * metadata (never the raw recordings or signed URLs). Owner-scoped only.
 */
export const runtime = "nodejs";

export type ExportDeps = {
  getPrincipal: (request: Request) => Principal | null;
  getProfile: (uid: string) => Promise<CreatorProfile | null>;
  listSessions: (uid: string) => Promise<VoiceSession[]>;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "content-disposition": "attachment; filename=export.json" },
  });
}

export async function handleExport(request: Request, deps: ExportDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal) return json(403, { error: "forbidden" });

  const [profile, sessions] = await Promise.all([deps.getProfile(principal.uid), deps.listSessions(principal.uid)]);
  return json(200, {
    uid: principal.uid,
    role: principal.role,
    profile,
    // Metadata only — recordings and signed URLs are intentionally excluded.
    voiceSessions: sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      status: s.status,
      recordingStored: s.recordingStored,
      transcriptTurns: s.transcript.length,
    })),
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const principal = await getServerPrincipal(request);
  const profiles = creatorProfilesRepository();
  const sessions = voiceSessionsRepository();
  return handleExport(request, {
    getPrincipal: () => principal,
    getProfile: (uid) => profiles.get(uid),
    listSessions: (uid) => sessions.listByUid(uid),
  });
}
