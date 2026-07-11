import type { Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { IsoTimestampSchema, UidSchema } from "@jj/shared";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Append-only audit log. Records who did what and when — never secrets or
 * free-form personal content, only an action key and a redacted summary.
 */
export const AuditEventSchema = z
  .object({
    id: z.string().min(1),
    at: IsoTimestampSchema,
    actorUid: UidSchema,
    action: z.string().min(1),
    summary: z.string().max(500).default(""),
  })
  .strict();
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AUDIT_EVENTS_COLLECTION = "auditEvents";

export function auditEventsRepository(db: Firestore = getDb()) {
  const col = db.collection(AUDIT_EVENTS_COLLECTION).withConverter(zodConverter(AuditEventSchema));
  return {
    async append(event: AuditEvent): Promise<AuditEvent> {
      const parsed = AuditEventSchema.parse(event);
      await col.doc(parsed.id).create(parsed);
      return parsed;
    },
    async listByActor(actorUid: string): Promise<AuditEvent[]> {
      const snap = await col.where("actorUid", "==", actorUid).get();
      return snap.docs.map((d) => d.data() as AuditEvent);
    },
  };
}
