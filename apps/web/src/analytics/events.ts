/**
 * Privacy-safe launch analytics contract.
 *
 * Only an allowlist of event names and non-identifying property keys may ever
 * be sent. Anything that could carry PII (email, name, handle, free text) is
 * dropped by {@link sanitizeEventProps} before it can leave the browser.
 */

export const ANALYTICS_EVENTS = ["marketing_view", "waitlist_view", "waitlist_submitted"] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEvent(value: string): value is AnalyticsEvent {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

/** Non-identifying keys that are safe to record. */
export const ALLOWED_PROP_KEYS = ["role", "locale", "side"] as const;
export type AnalyticsPropKey = (typeof ALLOWED_PROP_KEYS)[number];
export type AnalyticsProps = Partial<Record<AnalyticsPropKey, string>>;

/**
 * Keep only allowlisted, short, string-valued props. Everything else — most
 * importantly any PII a caller passes by mistake — is discarded.
 */
export function sanitizeEventProps(props: Record<string, unknown>): AnalyticsProps {
  const safe: AnalyticsProps = {};
  for (const key of ALLOWED_PROP_KEYS) {
    const value = props[key];
    if (typeof value === "string" && value.length > 0 && value.length <= 64) {
      safe[key] = value;
    }
  }
  return safe;
}

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  props: AnalyticsProps;
  ts: number;
}
