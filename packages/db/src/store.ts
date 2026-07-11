/**
 * Minimal document-store abstraction the repositories build on. A production
 * Firestore adapter and an in-memory adapter both satisfy it, so all repository
 * and API logic is unit-testable without the emulator.
 */

export type Comparator = "==" | "<" | "<=" | ">" | ">=" | "in";

export interface QueryFilter {
  field: string;
  op: Comparator;
  value: unknown;
}

export interface QueryOptions {
  where?: QueryFilter[];
  orderBy?: { field: string; dir?: "asc" | "desc" };
  limit?: number;
}

export interface StoredDoc<T> {
  id: string;
  data: T;
}

export interface DocumentStore {
  get<T>(collection: string, id: string): Promise<T | null>;
  set<T>(collection: string, id: string, data: T): Promise<void>;
  create<T>(collection: string, data: T, id?: string): Promise<string>;
  update<T>(collection: string, id: string, patch: Partial<T>): Promise<void>;
  remove(collection: string, id: string): Promise<void>;
  query<T>(collection: string, options?: QueryOptions): Promise<StoredDoc<T>[]>;
}

export function matchesFilters(
  data: Record<string, unknown>,
  filters: readonly QueryFilter[] | undefined,
): boolean {
  if (!filters) return true;
  return filters.every(({ field, op, value }) => {
    const actual = data[field];
    switch (op) {
      case "==":
        return actual === value;
      case "<":
        return (actual as number) < (value as number);
      case "<=":
        return (actual as number) <= (value as number);
      case ">":
        return (actual as number) > (value as number);
      case ">=":
        return (actual as number) >= (value as number);
      case "in":
        return Array.isArray(value) && value.includes(actual);
      default:
        return false;
    }
  });
}
