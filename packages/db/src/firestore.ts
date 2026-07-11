import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Admin Firestore factory. When FIRESTORE_EMULATOR_HOST is set (tests), the
 * Admin SDK automatically targets the emulator. Repositories are the only code
 * that touches Firestore; route handlers consume repositories.
 */
let cached: Firestore | null = null;

export function getDb(): Firestore {
  if (cached) return cached;
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "demo-jj";
  const app = getApps()[0] ?? initializeApp({ projectId });
  cached = getFirestore(app);
  return cached;
}

/** Test helper: drop the cached instance (e.g. between emulator resets). */
export function resetDbForTests(): void {
  cached = null;
}
