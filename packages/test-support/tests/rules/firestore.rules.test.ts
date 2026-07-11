import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const RULES_PATH = join(process.cwd(), "../../infra/firebase/firestore.rules");
const OWNER = "creator-1";
const OTHER = "brand-9";

function emulatorHostPort(): { host: string; port: number } {
  const raw = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
  const [host, port] = raw.replace(/^https?:\/\//, "").split(":");
  return { host: host || "127.0.0.1", port: Number(port ?? 8080) };
}

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const { host, port } = emulatorHostPort();
  testEnv = await initializeTestEnvironment({
    projectId: "demo-jj",
    firestore: { rules: readFileSync(RULES_PATH, "utf8"), host, port },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${OWNER}`), { role: "creator" });
  });
});

describe("firestore default-deny rules", () => {
  it("lets an owner read their own user document", async () => {
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertSucceeds(getDoc(doc(db, `users/${OWNER}`)));
  });

  it("denies a different signed-in user reading someone else's document", async () => {
    const db = testEnv.authenticatedContext(OTHER).firestore();
    await assertFails(getDoc(doc(db, `users/${OWNER}`)));
  });

  it("denies unauthenticated reads", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, `users/${OWNER}`)));
  });

  it("denies all client writes (identity is server-only)", async () => {
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(setDoc(doc(db, `users/${OWNER}`), { role: "creator" }));
  });

  it("denies access to server-mediated collections entirely", async () => {
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(getDoc(doc(db, `deals/deal-1`)));
  });
});
