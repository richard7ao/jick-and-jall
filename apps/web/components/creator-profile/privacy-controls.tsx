"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { CreatorProfileCopy } from "@/lib/copy/creator-profile";

export function PrivacyControls({ copy }: { copy: CreatorProfileCopy }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  async function requestExport(): Promise<void> {
    setExporting(true);
    try {
      await fetch("/api/account/export", { method: "POST" });
    } catch {
      /* surface neutral confirmation regardless */
    } finally {
      setExporting(false);
      setExported(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={requestExport} disabled={exporting} variant="ghost">
        {copy.exportAccount}
      </Button>
      {exported ? (
        <p role="status" className="text-sm text-muted">
          {copy.exportStarted}
        </p>
      ) : null}
    </div>
  );
}
