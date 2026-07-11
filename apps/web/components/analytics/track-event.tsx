"use client";

import { useEffect } from "react";

import { track } from "@/src/analytics/track";
import type { AnalyticsEvent, AnalyticsProps } from "@/src/analytics/events";

/**
 * Fires a single analytics event when it mounts (e.g. a page view). Rendering
 * nothing keeps it safe to drop into any server-rendered page.
 */
export function TrackEvent({ event, props }: { event: AnalyticsEvent; props?: AnalyticsProps }) {
  useEffect(() => {
    track(event, props);
    // Fire once per mount; props are primitive and stable per page render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
