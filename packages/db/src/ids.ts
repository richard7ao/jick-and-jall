import { randomUUID } from "node:crypto";

/** Injectable clock so tests can pin timestamps. */
export interface Clock {
  now(): string;
}

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

export function newId(): string {
  return randomUUID();
}
