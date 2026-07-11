import { getRepositories } from "@jj/db";
import { requireSession } from "@jj/auth";

import { fail, getSession, handleError, json } from "@/lib/server/api";

interface MessageBody {
  body?: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const session = requireSession(await getSession());
    const { id } = await params;
    const messages = await getRepositories().messages.listByThread(id);
    return json(
      messages.map((m) => ({
        id: m.id,
        mine: m.senderUid === session.uid,
        body: m.body,
      })),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const session = requireSession(await getSession());
    const { id } = await params;
    const b = (await request.json()) as MessageBody;
    if (!b.body || b.body.trim().length === 0) return fail(400, "empty message");
    const message = await getRepositories().messages.add({
      threadId: id,
      senderUid: session.uid,
      body: b.body.trim(),
    });
    return json({ id: message.id }, 201);
  } catch (error) {
    return handleError(error);
  }
}
