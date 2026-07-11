"use client";

import { useCallback, useState } from "react";

/**
 * Voice onboarding session state. A voice failure never loses progress: the
 * captured transcript turns are preserved and the caller can fall back to the
 * equivalent text path.
 */
export type VoiceStatus = "idle" | "active" | "completed" | "failed";
export type Turn = { role: "agent" | "user"; text: string };

export function useVoiceSession() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);

  const begin = useCallback(() => {
    setStatus("active");
    setTurns([]);
  }, []);

  const addTurn = useCallback((turn: Turn) => {
    setTurns((prev) => [...prev, turn]);
  }, []);

  const complete = useCallback(() => setStatus("completed"), []);

  // Preserve captured turns; the UI offers the text path to continue.
  const fail = useCallback(() => setStatus("failed"), []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTurns([]);
  }, []);

  return { status, turns, begin, addTurn, complete, fail, reset };
}
