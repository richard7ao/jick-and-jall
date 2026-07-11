import type { Principal } from "@jj/auth";
import { readSessionCookie, verifyCsrfToken } from "@jj/auth";
import { usersRepository } from "@jj/db";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-side principal resolution. Verifies the Firebase session cookie with
 * the Admin SDK, then loads the user's immutable role from Firestore. Client
 * role/redirect params are never trusted.
 */
function adminAuth() {
  const app = getApps()[0] ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-jj" });
  return getAuth(app);
}

export async function getServerPrincipal(request: Request): Promise<Principal | null> {
  const cookie = readSessionCookie(request.headers.get("cookie"));
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const user = await usersRepository().get(decoded.uid);
    return user ? { uid: user.uid, role: user.role } : null;
  } catch {
    return null;
  }
}

/** Double-submit CSRF check for mutating requests. */
export function csrfOk(request: Request): boolean {
  const header = request.headers.get("x-csrf-token");
  const match = /(?:^|;\s*)csrf=([^;]+)/.exec(request.headers.get("cookie") ?? "");
  return verifyCsrfToken(header, match ? decodeURIComponent(match[1]!) : undefined);
}
