/**
 * Minimal, consent-respecting analytics dispatcher.
 *
 * The tracker no-ops on the server, when Do-Not-Track is set, and for unknown
 * events. Props are always sanitized to the allowlist before transport, so no
 * personal data can leak into a launch metric.
 */

import { isAnalyticsEvent, sanitizeEventProps, type AnalyticsPayload } from "./events";

export type AnalyticsTransport = (payload: AnalyticsPayload) => void;

export interface TrackerOptions {
  transport?: AnalyticsTransport;
  doNotTrack?: boolean;
}

const ANALYTICS_ENDPOINT = "/api/analytics";

function browserDoNotTrack(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.doNotTrack === "1";
}

function beaconTransport(payload: AnalyticsPayload): void {
  if (typeof navigator === "undefined") return;
  const body = JSON.stringify(payload);
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
    return;
  }
  void fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function createTracker(
  options: TrackerOptions = {},
): (event: string, props?: Record<string, unknown>) => boolean {
  const transport = options.transport ?? beaconTransport;
  const disabled = options.doNotTrack ?? browserDoNotTrack();

  return (event, props = {}) => {
    if (disabled || !isAnalyticsEvent(event)) return false;
    transport({
      event,
      props: sanitizeEventProps(props),
      ts: Date.now(),
    });
    return true;
  };
}

/** Default singleton used by client components. */
export const track = createTracker();
