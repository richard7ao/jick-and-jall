"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import type { BrandEditorsCopy } from "@/lib/copy/brand-editors";
import type { Locale } from "@/lib/i18n";

export function BrandProfileEditor({ locale, copy }: { locale: Locale; copy: BrandEditorsCopy }) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [values, setValues] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(): Promise<void> {
    setBusy(true);
    try {
      await fetch("/api/jall/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, name, sector, values }),
      });
    } catch {
      /* neutral */
    } finally {
      setBusy(false);
      setSaved(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label={copy.brandName} id="b-name">
        <TextInput id="b-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label={copy.sector} id="b-sector">
        <TextInput id="b-sector" value={sector} onChange={(e) => setSector(e.target.value)} />
      </Field>
      <Field label={copy.values} id="b-values">
        <TextArea id="b-values" value={values} onChange={(e) => setValues(e.target.value)} />
      </Field>
      <div className="flex items-center gap-3">
        <Button variant="accent" onClick={save} disabled={busy}>
          {copy.save}
        </Button>
        {saved ? (
          <span role="status" className="text-sm text-muted">
            {copy.saved}
          </span>
        ) : null}
      </div>
    </div>
  );
}
