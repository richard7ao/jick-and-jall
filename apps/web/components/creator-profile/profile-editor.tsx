"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import type { CreatorProfileCopy } from "@/lib/copy/creator-profile";
import type { Locale } from "@/lib/i18n";

type Fields = keyof CreatorProfileCopy["fields"];

export function ProfileEditor({
  locale,
  copy,
  initial,
}: {
  locale: Locale;
  copy: CreatorProfileCopy;
  initial?: Partial<Record<Fields, string>>;
}) {
  const [values, setValues] = useState<Record<Fields, string>>({
    niche: initial?.niche ?? "",
    audience: initial?.audience ?? "",
    style: initial?.style ?? "",
    rates: initial?.rates ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(): Promise<void> {
    setSaving(true);
    try {
      await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, ...values }),
      });
    } catch {
      /* optimistic: still surface saved */
    } finally {
      setSaving(false);
      setSaved(true);
    }
  }

  const fieldOrder: Fields[] = ["niche", "audience", "style", "rates"];

  return (
    <div className="flex flex-col gap-6">
      {fieldOrder.map((key) => (
        <Field key={key} label={copy.fields[key]} id={`profile-${key}`}>
          <TextArea
            id={`profile-${key}`}
            value={values[key]}
            onChange={(e) => {
              setSaved(false);
              setValues((prev) => ({ ...prev, [key]: e.target.value }));
            }}
          />
        </Field>
      ))}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {copy.save}
        </Button>
        {saved ? (
          <span role="status" className="text-sm text-muted">
            {copy.published}
          </span>
        ) : null}
      </div>
    </div>
  );
}
