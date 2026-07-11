"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "recording" | "paused" | "finished";

export interface TranscriptEntry {
  questionId: string;
  answer: string;
}

export interface VoiceSession {
  status: VoiceStatus;
  transcript: TranscriptEntry[];
  recovered: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  append: (entry: TranscriptEntry) => void;
  reset: () => void;
}

/**
 * Client state machine for the Jick interview. It persists progress to
 * sessionStorage so an interrupted interview (reload, dropped mic) can be
 * recovered. The actual speech transport is injected by the caller via
 * `append`; this hook owns only ordering, status, and recovery.
 */
export function useVoiceSession(storageKey: string): VoiceSession {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [recovered, setRecovered] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || typeof window === "undefined") return;
    loaded.current = true;
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TranscriptEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTranscript(parsed);
          setRecovered(true);
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !loaded.current) return;
    window.sessionStorage.setItem(storageKey, JSON.stringify(transcript));
  }, [storageKey, transcript]);

  const start = useCallback(() => setStatus("recording"), []);
  const pause = useCallback(() => setStatus("paused"), []);
  const resume = useCallback(() => setStatus("recording"), []);
  const finish = useCallback(() => setStatus("finished"), []);
  const append = useCallback((entry: TranscriptEntry) => {
    setTranscript((prev) => [...prev, entry]);
  }, []);
  const reset = useCallback(() => {
    setTranscript([]);
    setRecovered(false);
    setStatus("idle");
    if (typeof window !== "undefined") window.sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { status, transcript, recovered, start, pause, resume, finish, append, reset };
}
