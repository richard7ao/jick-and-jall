"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { parseBudgetGbp, type BrandEditorsCopy } from "@/lib/copy/brand-editors";
import type { Locale } from "@/lib/i18n";

export function CampaignEditor({ locale, copy }: { locale: Locale; copy: BrandEditorsCopy }) {
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetError, setBudgetError] = useState<string | undefined>();
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  async function publish(): Promise<void> {
    const minorUnits = parseBudgetGbp(budget);
    if (minorUnits === null) {
      setBudgetError(copy.budgetError);
      return;
    }
    setBudgetError(undefined);
    setBusy(true);
    try {
      await fetch("/api/jall/campaign", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          goals,
          audience,
          deliverables,
          budgetMinorUnits: minorUnits,
        }),
      });
    } catch {
      /* neutral */
    } finally {
      setBusy(false);
      setPublished(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label={copy.goals} id="c-goals">
        <TextArea id="c-goals" value={goals} onChange={(e) => setGoals(e.target.value)} />
      </Field>
      <Field label={copy.audience} id="c-audience">
        <TextArea id="c-audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
      </Field>
      <Field label={copy.deliverables} id="c-deliverables">
        <TextArea
          id="c-deliverables"
          value={deliverables}
          onChange={(e) => setDeliverables(e.target.value)}
        />
      </Field>
      <Field label={copy.budget} id="c-budget" hint={copy.budgetHint} error={budgetError}>
        <TextInput
          id="c-budget"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button variant="accent" onClick={publish} disabled={busy}>
          {copy.publish}
        </Button>
        {published ? (
          <span role="status" className="text-sm text-muted">
            {copy.published}
          </span>
        ) : null}
      </div>
    </div>
  );
}
