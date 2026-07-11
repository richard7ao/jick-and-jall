"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import type { JallCopy } from "@/lib/copy/jall";
import type { Locale } from "@/lib/i18n";

type Step = "mode" | "interview" | "preview";
type Mode = "voice" | "text";

export function CampaignIntake({ locale, copy }: { locale: Locale; copy: JallCopy }) {
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode>("voice");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);

  const setAnswer = (id: string, text: string) => setAnswers((prev) => ({ ...prev, [id]: text }));

  async function publish(): Promise<void> {
    setBusy(true);
    try {
      await fetch("/api/jall/campaign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, mode, answers }),
      });
    } catch {
      /* neutral confirmation */
    } finally {
      setBusy(false);
      setPublished(true);
    }
  }

  if (published) {
    return (
      <p role="status" data-testid="jall-published" className="text-lg">
        {copy.published}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black">{copy.title}</h1>
        <p className="text-muted">{copy.intro}</p>
      </div>

      {step === "mode" ? (
        <section className="flex flex-col gap-4">
          <div className="flex gap-3">
            {(["voice", "text"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-2xl border-2 p-6 text-left font-display font-bold ${
                  mode === m ? "border-accent bg-accent/10" : "border-border"
                }`}
              >
                {m === "voice" ? copy.modeVoice : copy.modeText}
              </button>
            ))}
          </div>
          <Button variant="accent" onClick={() => setStep("interview")}>
            {copy.start}
          </Button>
        </section>
      ) : null}

      {step === "interview" || step === "preview" ? (
        <section className="flex flex-col gap-6">
          {step === "preview" ? (
            <h2 className="font-display text-xl font-bold">{copy.previewTitle}</h2>
          ) : null}
          {copy.questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <label htmlFor={`jall-${q.id}`} className="font-display font-bold">
                {q.prompt}
              </label>
              <TextArea
                id={`jall-${q.id}`}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            </div>
          ))}
          {step === "interview" ? (
            <Button variant="accent" onClick={() => setStep("preview")}>
              {copy.finish}
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="accent" onClick={publish} disabled={busy}>
                {copy.publish}
              </Button>
              <Button variant="ghost" onClick={publish} disabled={busy}>
                {copy.saveDraft}
              </Button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
