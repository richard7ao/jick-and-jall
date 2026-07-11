/**
 * Integer-only payment ledger reconciliation. Every entry is GBP minor units.
 * Live automatic payout, refund, and reversal remain disabled: only funding and
 * (recorded, non-executed) payout-intent entries exist in v1.
 */
export type LedgerEntryKind = "charge" | "payout_intent";

export type LedgerEntry = {
  readonly dealId: string;
  readonly kind: LedgerEntryKind;
  readonly amountMinor: number;
};

export type Reconciliation = {
  readonly chargedMinor: number;
  readonly payoutIntentMinor: number;
  readonly platformNetMinor: number;
};

export function reconcile(entries: readonly LedgerEntry[]): Reconciliation {
  let chargedMinor = 0;
  let payoutIntentMinor = 0;
  for (const e of entries) {
    if (!Number.isInteger(e.amountMinor)) throw new Error("ledger amounts must be integer minor units");
    if (e.kind === "charge") chargedMinor += e.amountMinor;
    else payoutIntentMinor += e.amountMinor;
  }
  return { chargedMinor, payoutIntentMinor, platformNetMinor: chargedMinor - payoutIntentMinor };
}
