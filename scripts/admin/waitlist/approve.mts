/**
 * Allowlisted admin utility to approve a waitlist entry: creates a single-use
 * invitation and marks the entry approved. Run against the emulator or a real
 * project via the Admin SDK. Email sending is left to the API route/provider.
 *
 * Usage: tsx scripts/admin/waitlist/approve.mts <entryId>
 */

import { invitationsRepository, waitlistRepository } from "@jj/db";
import { SCHEMA_VERSION, type Invitation } from "@jj/shared";

const TTL_DAYS = 7;

export async function approveEntry(entryId: string, now = new Date().toISOString()): Promise<Invitation> {
  const waitlist = waitlistRepository();
  const invitations = invitationsRepository();

  const entry = await waitlist.get(entryId);
  if (!entry) throw new Error(`waitlist entry not found: ${entryId}`);

  const invitation = await invitations.create({
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: crypto.randomUUID(),
    email: entry.email,
    role: entry.role,
    expiresAt: new Date(Date.parse(now) + TTL_DAYS * 86_400_000).toISOString(),
    consumedAt: null,
  });
  await waitlist.setStatus(entry.id, "approved", now);
  return invitation;
}

async function main(): Promise<void> {
  const entryId = process.argv[2];
  if (!entryId) throw new Error("usage: approve.mts <entryId>");
  const invitation = await approveEntry(entryId);
  console.log(`approved ${entryId}; invitation ${invitation.id} expires ${invitation.expiresAt}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
