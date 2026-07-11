/**
 * Hermes developer-partner smoke check.
 *
 * Confirms the Hermes CLI is installed and reachable and that a config exists,
 * without printing any provider body. This is developer-side only; if the
 * Hermes CLI is not installed it fails loudly rather than pretending success.
 *
 * Usage: node hermes-smoke.mts [--no-print-body]
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

function hermesAvailable(): boolean {
  try {
    execFileSync("hermes", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main(): void {
  if (!hermesAvailable()) {
    console.error(
      "hermes:smoke failed: Hermes CLI not installed. Install it and configure .hermes/config.yaml from the example.",
    );
    process.exit(1);
  }
  if (!existsSync(".hermes/config.yaml")) {
    console.error("hermes:smoke failed: .hermes/config.yaml missing (copy from .hermes/config.example.yaml).");
    process.exit(1);
  }
  // Body printing is always suppressed regardless of the flag; the flag is
  // accepted for interface compatibility with the spec's tier-4 command.
  execFileSync("hermes", ["status"], { stdio: "ignore" });
  console.log("hermes:smoke ok — CLI reachable, config present, no body printed");
}

if (import.meta.url === `file://${process.argv[1]}`) main();
