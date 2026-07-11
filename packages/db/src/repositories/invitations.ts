import {
  InvitationSchema,
  SCHEMA_VERSION,
  type Invitation,
  type Role,
} from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "invitations";
const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export class InvitationRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async create(
    email: string,
    role: Role,
    ttlMs: number = DEFAULT_TTL_MS,
  ): Promise<Invitation> {
    const now = this.clock.now();
    const invitation = InvitationSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      email,
      role,
      expiresAt: new Date(Date.parse(now) + ttlMs).toISOString(),
      consumedAt: null,
    });
    await this.store.set(COLLECTION, invitation.id, invitation);
    return invitation;
  }

  async getById(id: string): Promise<Invitation | null> {
    return this.store.get<Invitation>(COLLECTION, id);
  }

  /** A code is valid when it exists, matches the email, is unconsumed and unexpired. */
  isRedeemable(invitation: Invitation, email: string): boolean {
    const now = Date.parse(this.clock.now());
    return (
      invitation.email === email &&
      invitation.consumedAt === null &&
      Date.parse(invitation.expiresAt) > now
    );
  }

  async consume(id: string): Promise<void> {
    await this.store.update<Invitation>(COLLECTION, id, {
      consumedAt: this.clock.now(),
      updatedAt: this.clock.now(),
    });
  }
}
