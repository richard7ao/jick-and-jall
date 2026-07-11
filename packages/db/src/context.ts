import { FirestoreStore } from "./firestore-store.js";
import { InMemoryStore } from "./in-memory-store.js";
import { createRepositories, type Repositories } from "./repositories.js";
import type { DocumentStore } from "./store.js";

/**
 * Process-wide repositories singleton used by server route handlers.
 *
 * Firestore is selected when a credential or emulator host is present (or when
 * JJ_STORE=firestore); otherwise the deterministic in-memory store is used so
 * local/dev/test runs need no external services.
 */
let store: DocumentStore | null = null;
let repositories: Repositories | null = null;

function useFirestore(): boolean {
  return (
    process.env.JJ_STORE === "firestore" ||
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );
}

function defaultStore(): DocumentStore {
  return useFirestore() ? new FirestoreStore() : new InMemoryStore();
}

export function setStore(next: DocumentStore): void {
  store = next;
  repositories = null;
}

export function getRepositories(): Repositories {
  if (!repositories) {
    store ??= defaultStore();
    repositories = createRepositories(store);
  }
  return repositories;
}
