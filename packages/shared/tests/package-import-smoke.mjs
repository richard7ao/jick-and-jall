// Tier 4 smoke: import the built package exactly as a consumer would and
// exercise a couple of exports. Fails loudly (non-zero exit) on any problem.
import assert from "node:assert/strict";
import {
  canTransitionDeal,
  computeBrandCharge,
  WaitlistSubmissionSchema,
  CONSENT_POLICY_VERSION,
} from "../dist/index.js";

assert.equal(canTransitionDeal("draft", "offered"), true);
assert.equal(canTransitionDeal("draft", "paid"), false);

assert.deepEqual(computeBrandCharge(10_000), {
  creatorAmountMinor: 10_000,
  platformFeeMinor: 1_000,
  brandChargeMinor: 11_000,
});

const parsed = WaitlistSubmissionSchema.parse({
  role: "brand",
  email: "smoke@example.com",
  locale: "en",
  consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
});
assert.equal(parsed.role, "brand");

console.log("package-import-smoke ok — @jj/shared built exports work");
