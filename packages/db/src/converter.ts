import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { ZodType } from "zod";

/**
 * Build a Firestore converter that validates with a Zod schema on the way both
 * in and out, so malformed documents never enter or leave the typed layer.
 */
export function zodConverter<T>(schema: ZodType<T>): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      return schema.parse(data) as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return schema.parse(snapshot.data());
    },
  };
}
