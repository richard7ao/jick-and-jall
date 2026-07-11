/**
 * Privacy-safe analytics. Events carry only a fixed allowlist of non-identifying
 * properties (role, locale). Emails and free-form data are never recorded.
 */

export type AnalyticsEventName = "waitlist_view" | "waitlist_submit" | "waitlist_success" | "locale_switch";

const ALLOWED_PROPS = ["role", "locale"] as const;
type AllowedProp = (typeof ALLOWED_PROPS)[number];

export type AnalyticsProps = Partial<Record<AllowedProp, string>>;

export type AnalyticsEvent = {
  readonly name: AnalyticsEventName;
  readonly props: AnalyticsProps;
};

/** Drop any property not on the allowlist (e.g. email, names, ids). */
export function sanitizeProps(input: Record<string, unknown>): AnalyticsProps {
  const out: AnalyticsProps = {};
  for (const key of ALLOWED_PROPS) {
    const value = input[key];
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export function buildEvent(name: AnalyticsEventName, props: Record<string, unknown> = {}): AnalyticsEvent {
  return { name, props: sanitizeProps(props) };
}

export type Sink = (event: AnalyticsEvent) => void;

/** Emit an event through a sink (defaults to a no-op so SSR never breaks). */
export function track(name: AnalyticsEventName, props: Record<string, unknown> = {}, sink: Sink = () => {}): void {
  sink(buildEvent(name, props));
}
