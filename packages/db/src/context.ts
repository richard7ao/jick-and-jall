import { InMemoryStore } from "./in-memory-store.js";
import { createRepositories, type Repositories } from "./repositories.js";
import type { DocumentStore } from "./store.js";

/**
 * Process-wide repositories singleton used by server route handlers.
 *
 * The default store is in-memory (deterministic, dependency-free). A Firestore
 * adapter can be injected via {@link setStore} at server startup once
 * firebase-admin and the emulator/JDK toolchain are available.
 */
let store: DocumentStore = new InMemoryStore();
let repositories: Repositories | null = null;

export function setStore(next: DocumentStore): void {
  store = next;
  repositories = null;
}

export function getRepositories(): Repositories {
  if (!repositories) repositories = createRepositories(store);
  return repositories;
}
