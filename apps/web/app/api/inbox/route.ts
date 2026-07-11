import { randomUUID } from "node:crypto";
import type { Principal } from "@jj/auth";
import {
  isThreadParticipant,
  matchesRepository,
  messagesRepository,
  threadsRepository,
  type Thread,
} from "@jj/db";
import { SCHEMA_VERSION, type Match, type Message } from "@jj/shared";
import type { NextRequest } from "next/server";
import { getServerPrincipal } from "../../../lib/server-auth";

/**
 * Authorized inbox. A thread can be opened only from a consented match, and
 * only its two participants (the matched brand and creator) can read or post.
 */
export const runtime = "nodejs";

export type InboxDeps = {
  getPrincipal: (request: Request) => Principal | null;
  getMatch: (id: string) => Promise<Match | null>;
  upsertThread: (thread: Thread) => Promise<Thread>;
  getThread: (id: string) => Promise<Thread | null>;
  listThreads: (uid: string) => Promise<Thread[]>;
  appendMessage: (message: Message) => Promise<Message>;
  now: () => string;
  threadId: (matchId: string) => string;
  messageId: () => string;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function handleOpenThread(request: Request, deps: InboxDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal) return json(403, { error: "forbidden" });

  let body: { matchId?: string };
  try {
    body = (await request.json()) as { matchId?: string };
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.matchId) return json(400, { error: "invalid_input" });

  const match = await deps.getMatch(body.matchId);
  if (!match) return json(404, { error: "not_found" });
  // Conversations require prior creator consent to disclosure.
  if (!match.disclosureConsented) return json(409, { error: "consent_required" });
  if (principal.uid !== match.brandUid && principal.uid !== match.creatorUid) return json(403, { error: "forbidden" });

  const now = deps.now();
  const thread = await deps.upsertThread({
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: deps.threadId(match.id),
    matchId: match.id,
    brandUid: match.brandUid,
    creatorUid: match.creatorUid,
  });
  return json(200, { threadId: thread.id });
}

export async function handleListThreads(request: Request, deps: InboxDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal) return json(403, { error: "forbidden" });
  return json(200, { threads: await deps.listThreads(principal.uid) });
}

export async function handleSendMessage(request: Request, deps: InboxDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal) return json(403, { error: "forbidden" });

  let body: { threadId?: string; body?: string };
  try {
    body = (await request.json()) as { threadId?: string; body?: string };
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.threadId || !body.body) return json(400, { error: "invalid_input" });

  const thread = await deps.getThread(body.threadId);
  if (!thread) return json(404, { error: "not_found" });
  if (!isThreadParticipant(thread, principal.uid)) return json(403, { error: "forbidden" });

  const now = deps.now();
  const message = await deps.appendMessage({
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: deps.messageId(),
    threadId: thread.id,
    senderUid: principal.uid,
    body: body.body,
  });
  return json(201, { id: message.id });
}

function wire(principal: Principal | null): InboxDeps {
  const matches = matchesRepository();
  const threads = threadsRepository();
  const messages = messagesRepository();
  return {
    getPrincipal: () => principal,
    getMatch: (id) => matches.get(id),
    upsertThread: (thread) => threads.upsert(thread),
    getThread: (id) => threads.get(id),
    listThreads: (uid) => threads.listForUser(uid),
    appendMessage: (message) => messages.append(message),
    now: () => new Date().toISOString(),
    threadId: (matchId) => `thread_${matchId}`,
    messageId: () => randomUUID(),
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  return handleListThreads(request, wire(await getServerPrincipal(request)));
}

export async function POST(request: NextRequest): Promise<Response> {
  return handleOpenThread(request, wire(await getServerPrincipal(request)));
}

export async function PUT(request: NextRequest): Promise<Response> {
  return handleSendMessage(request, wire(await getServerPrincipal(request)));
}
