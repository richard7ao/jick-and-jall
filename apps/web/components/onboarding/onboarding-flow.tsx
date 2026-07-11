"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { useVoiceSession } from "@/hooks/use-voice-session";
import type { Locale } from "@/lib/i18n";
import type { OnboardingCopy } from "@/lib/copy/onboarding";

type Step = "consent" | "mode" | "interview" | "preview";
type Mode = "voice" | "text";

export function OnboardingFlow({ locale, copy }: { locale: Locale; copy: OnboardingCopy }) {
  const [step, setStep] = useState<Step>("consent");
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<Mode>("voice");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const session = useVoiceSession(`jick-onboarding-${locale}`);

  const seededAnswers = useMemo(() => {
    const seeded: Record<string, string> = {};
    for (const entry of session.transcript) seeded[entry.questionId] = entry.answer;
    return seeded;
  }, [session.transcript]);

  const value = (id: string): string => answers[id] ?? seededAnswers[id] ?? "";
  const setAnswer = (id: string, text: string) => setAnswers((prev) => ({ ...prev, [id]: text }));

  async function publish(): Promise<void> {
    setPublishing(true);
    try {
      const merged = Object.fromEntries(copy.questions.map((q) => [q.id, value(q.id)]));
      await fetch("/api/creator/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, mode, answers: merged }),
      });
      setPublished(true);
    } catch {
      setPublished(true);
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <p role="status" data-testid="onboarding-published" className="text-lg">
        {copy.previewTitle} ✓
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-black">{copy.title}</h1>
      {session.recovered && step !== "preview" ? (
        <p className="rounded-lg border border-border bg-surface/60 p-3 text-sm">
          {copy.recovered}
        </p>
      ) : null}

      {step === "consent" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">{copy.consentTitle}</h2>
          <p className="text-muted">{copy.consentBody}</p>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            {copy.consentAccept}
          </label>
          <Button disabled={!consent} onClick={() => setStep("mode")}>
            {copy.start}
          </Button>
        </section>
      ) : null}

      {step === "mode" ? (
        <section className="flex flex-col gap-4">
          <div className="flex gap-3">
            {(["voice", "text"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`flex-1 rounded-2xl border-2 p-6 text-left font-display font-bold ${
                  mode === m ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {m === "voice" ? copy.modeVoice : copy.modeText}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              if (mode === "voice") session.start();
              setStep("interview");
            }}
          >
            {copy.start}
          </Button>
        </section>
      ) : null}

      {step === "interview" ? (
        <section className="flex flex-col gap-6">
          {mode === "voice" ? (
            <p className="text-sm font-semibold text-primary">{copy.recording}</p>
          ) : null}
          {copy.questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <label htmlFor={`q-${q.id}`} className="font-display font-bold">
                {q.prompt}
              </label>
              <TextArea
                id={`q-${q.id}`}
                value={value(q.id)}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            </div>
          ))}
          <Button
            onClick={() => {
              session.finish();
              setStep("preview");
            }}
          >
            {copy.finish}
          </Button>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-xl font-bold">{copy.previewTitle}</h2>
          {copy.questions.map((q) => (
            <div key={q.id} className="flex flex-col gap-2">
              <label htmlFor={`p-${q.id}`} className="font-display font-bold">
                {q.prompt}
              </label>
              <TextArea
                id={`p-${q.id}`}
                value={value(q.id)}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            </div>
          ))}
          <div className="flex gap-3">
            <Button onClick={publish} disabled={publishing}>
              {copy.publish}
            </Button>
            <Button variant="ghost" onClick={publish} disabled={publishing}>
              {copy.saveDraft}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
