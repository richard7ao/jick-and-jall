import {
  matchesFilters,
  type DocumentStore,
  type QueryOptions,
  type StoredDoc,
} from "./store.js";

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/** Deterministic in-memory store for unit tests (no emulator required). */
export class InMemoryStore implements DocumentStore {
  private readonly data = new Map<string, Map<string, unknown>>();
  private seq = 0;

  private col(name: string): Map<string, unknown> {
    let map = this.data.get(name);
    if (!map) {
      map = new Map();
      this.data.set(name, map);
    }
    return map;
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const value = this.col(collection).get(id);
    return value === undefined ? null : (structuredClone(value) as T);
  }

  async set<T>(collection: string, id: string, data: T): Promise<void> {
    this.col(collection).set(id, structuredClone(data));
  }

  async create<T>(collection: string, data: T, id?: string): Promise<string> {
    const key = id ?? `${collection}_${(this.seq += 1)}`;
    this.col(collection).set(key, structuredClone(data));
    return key;
  }

  async update<T>(
    collection: string,
    id: string,
    patch: Partial<T>,
  ): Promise<void> {
    const current = this.col(collection).get(id);
    if (current === undefined) {
      throw new Error(`${collection}/${id} not found`);
    }
    this.col(collection).set(id, {
      ...(current as Record<string, unknown>),
      ...patch,
    });
  }

  async remove(collection: string, id: string): Promise<void> {
    this.col(collection).delete(id);
  }

  async query<T>(
    collection: string,
    options?: QueryOptions,
  ): Promise<StoredDoc<T>[]> {
    let rows = [...this.col(collection).entries()].map(([id, data]) => ({
      id,
      data: data as T,
    }));
    rows = rows.filter((row) =>
      matchesFilters(row.data as Record<string, unknown>, options?.where),
    );
    const orderBy = options?.orderBy;
    if (orderBy) {
      const dir = orderBy.dir === "desc" ? -1 : 1;
      rows.sort(
        (a, b) =>
          compare(
            (a.data as Record<string, unknown>)[orderBy.field],
            (b.data as Record<string, unknown>)[orderBy.field],
          ) * dir,
      );
    }
    if (options?.limit !== undefined) rows = rows.slice(0, options.limit);
    return rows.map((row) => ({ id: row.id, data: structuredClone(row.data) }));
  }
}
