import {
  SCHEMA_VERSION,
  UserRecordSchema,
  type Locale,
  type Role,
  type UserRecord,
} from "@jj/shared";

import { systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "users";

export class UsersRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Roles are immutable: re-creating with a different role is rejected. */
  async create(input: {
    uid: string;
    email: string;
    role: Role;
    locale: Locale;
  }): Promise<UserRecord> {
    const existing = await this.getByUid(input.uid);
    if (existing) {
      if (existing.role !== input.role) {
        throw new Error("role is immutable for an existing account");
      }
      return existing;
    }
    const now = this.clock.now();
    const user = UserRecordSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      uid: input.uid,
      email: input.email,
      role: input.role,
      locale: input.locale,
    });
    await this.store.set(COLLECTION, user.uid, user);
    return user;
  }

  async getByUid(uid: string): Promise<UserRecord | null> {
    return this.store.get<UserRecord>(COLLECTION, uid);
  }

  async getByEmail(email: string): Promise<UserRecord | null> {
    const [row] = await this.store.query<UserRecord>(COLLECTION, {
      where: [{ field: "email", op: "==", value: email }],
      limit: 1,
    });
    return row?.data ?? null;
  }
}
