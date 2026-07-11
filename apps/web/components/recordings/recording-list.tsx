"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CreatorProfileCopy } from "@/lib/copy/creator-profile";

interface Recording {
  id: string;
  createdAt: string;
  url?: string;
}

export function RecordingList({ copy }: { copy: CreatorProfileCopy }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/creator/recordings")
      .then((r) => (r.ok ? (r.json() as Promise<Recording[]>) : []))
      .then((data) => {
        if (active) setRecordings(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(id: string): Promise<void> {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/creator/recordings/${id}`, { method: "DELETE" }).catch(() => {});
  }

  if (loaded && recordings.length === 0) {
    return <p className="text-muted">{copy.recordingsEmpty}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {recordings.map((rec) => (
        <li
          key={rec.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
        >
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">{rec.createdAt}</span>
            {rec.url ? (
              <audio controls preload="none" src={rec.url} aria-label={copy.play} />
            ) : null}
          </div>
          <Button variant="ghost" onClick={() => remove(rec.id)}>
            {copy.deleteRecording}
          </Button>
        </li>
      ))}
    </ul>
  );
}
