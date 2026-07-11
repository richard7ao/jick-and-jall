import type { Locale } from "@/lib/i18n";

export interface JallQuestion {
  id: string;
  prompt: string;
}

export interface JallCopy {
  title: string;
  intro: string;
  modeVoice: string;
  modeText: string;
  start: string;
  finish: string;
  previewTitle: string;
  publish: string;
  saveDraft: string;
  published: string;
  questions: JallQuestion[];
}

const IDS = ["goals", "audience", "deliverables", "budget"] as const;

const copy: Record<Locale, JallCopy> = {
  en: {
    title: "Your brief with Jall",
    intro: "Describe your campaign and Jall turns it into a structured brief.",
    modeVoice: "Talk it through",
    modeText: "Type instead",
    start: "Start",
    finish: "Finish & preview",
    previewTitle: "Review your brief",
    publish: "Publish brief",
    saveDraft: "Save draft",
    published: "Brief saved.",
    questions: [
      { id: IDS[0], prompt: "What are the goals of this campaign?" },
      { id: IDS[1], prompt: "Who should this reach?" },
      { id: IDS[2], prompt: "What deliverables do you need?" },
      { id: IDS[3], prompt: "What is your budget (GBP)?" },
    ],
  },
  es: {
    title: "Tu brief con Jall",
    intro: "Describe tu campaña y Jall la convierte en un brief estructurado.",
    modeVoice: "Hablarlo",
    modeText: "Escribir",
    start: "Empezar",
    finish: "Finalizar y previsualizar",
    previewTitle: "Revisa tu brief",
    publish: "Publicar brief",
    saveDraft: "Guardar borrador",
    published: "Brief guardado.",
    questions: [
      { id: IDS[0], prompt: "¿Cuáles son los objetivos de esta campaña?" },
      { id: IDS[1], prompt: "¿A quién debe llegar?" },
      { id: IDS[2], prompt: "¿Qué entregables necesitas?" },
      { id: IDS[3], prompt: "¿Cuál es tu presupuesto (GBP)?" },
    ],
  },
};

export function getJallCopy(locale: Locale): JallCopy {
  return copy[locale];
}
