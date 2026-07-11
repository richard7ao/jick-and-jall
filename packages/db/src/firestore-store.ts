/**
 * Production DocumentStore backed by Firestore (firebase-admin). The adapter is
 * a thin translation of the store interface onto Firestore's API. It is
 * exercised against the emulator in integration tests; unit tests use the
 * in-memory store.
 */

import { getApps, initializeApp } from "firebase-admin/app";
import {
  getFirestore,
  type Firestore,
  type Query,
} from "firebase-admin/firestore";

import type { DocumentStore, QueryOptions, StoredDoc } from "./store.js";

export function createFirestore(): Firestore {
  if (getApps().length === 0) {
    // Uses GOOGLE_APPLICATION_CREDENTIALS in production and
    // FIRESTORE_EMULATOR_HOST when pointed at the local emulator.
    initializeApp();
  }
  return getFirestore();
}

export class FirestoreStore implements DocumentStore {
  constructor(private readonly db: Firestore = createFirestore()) {}

  async get<T>(collection: string, id: string): Promise<T | null> {
    const snap = await this.db.collection(collection).doc(id).get();
    return snap.exists ? (snap.data() as T) : null;
  }

  async set<T>(collection: string, id: string, data: T): Promise<void> {
    await this.db.collection(collection).doc(id).set(data as Record<string, unknown>);
  }

  async create<T>(collection: string, data: T, id?: string): Promise<string> {
    if (id) {
      await this.set(collection, id, data);
      return id;
    }
    const ref = await this.db
      .collection(collection)
      .add(data as Record<string, unknown>);
    return ref.id;
  }

  async update<T>(
    collection: string,
    id: string,
    patch: Partial<T>,
  ): Promise<void> {
    await this.db
      .collection(collection)
      .doc(id)
      .update(patch as Record<string, unknown>);
  }

  async remove(collection: string, id: string): Promise<void> {
    await this.db.collection(collection).doc(id).delete();
  }

  async query<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<StoredDoc<T>[]> {
    let q: Query = this.db.collection(collection);
    for (const filter of options?.where ?? []) {
      q = q.where(filter.field, filter.op, filter.value);
    }
    if (options?.orderBy) {
      q = q.orderBy(options.orderBy.field, options.orderBy.dir ?? "asc");
    }
    if (options?.limit !== undefined) q = q.limit(options.limit);
    const snap = await q.get();
    return snap.docs.map((d) => ({ id: d.id, data: d.data() as T }));
  }
}
