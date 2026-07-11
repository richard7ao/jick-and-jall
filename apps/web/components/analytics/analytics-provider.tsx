"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { buildEvent, type AnalyticsEventName } from "../../src/analytics/events";

type TrackFn = (name: AnalyticsEventName, props?: Record<string, unknown>) => void;

const AnalyticsContext = createContext<TrackFn>(() => {});

/**
 * Minimal analytics provider. In production the sink would forward to a
 * privacy-safe collector; here events are sanitized and (by default) logged to
 * the console in development only. No PII ever leaves the sanitizer.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = useCallback<TrackFn>((name, props = {}) => {
    const event = buildEvent(name, props);
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event.name, event.props);
  }, []);

  return <AnalyticsContext.Provider value={track}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): TrackFn {
  return useContext(AnalyticsContext);
}
