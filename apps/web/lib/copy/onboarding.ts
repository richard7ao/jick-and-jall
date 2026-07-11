import type { Locale } from "@/lib/i18n";

export interface InterviewQuestion {
  id: string;
  prompt: string;
}

export interface OnboardingCopy {
  title: string;
  consentTitle: string;
  consentBody: string;
  consentAccept: string;
  languageLabel: string;
  modeVoice: string;
  modeText: string;
  start: string;
  recording: string;
  pause: string;
  resume: string;
  finish: string;
  transcriptEmpty: string;
  recovered: string;
  previewTitle: string;
  publish: string;
  saveDraft: string;
  questions: InterviewQuestion[];
}

const QUESTION_IDS = ["niche", "audience", "style", "rates"] as const;

const copy: Record<Locale, OnboardingCopy> = {
  en: {
    title: "Your interview with Jick",
    consentTitle: "Before we start",
    consentBody:
      "Jick records this conversation to build your profile. Recordings are private, default to 90-day retention, and you can delete them anytime.",
    consentAccept: "I consent to be recorded",
    languageLabel: "Interview language",
    modeVoice: "Talk it through",
    modeText: "Type instead",
    start: "Start",
    recording: "Listening…",
    pause: "Pause",
    resume: "Resume",
    finish: "Finish & preview",
    transcriptEmpty: "Your answers will appear here as you speak.",
    recovered: "We restored your interview in progress.",
    previewTitle: "Review your profile",
    publish: "Publish profile",
    saveDraft: "Save draft",
    questions: [
      { id: QUESTION_IDS[0], prompt: "What niche or topics do you create in?" },
      { id: QUESTION_IDS[1], prompt: "Who is your audience?" },
      { id: QUESTION_IDS[2], prompt: "How would you describe your style and voice?" },
      { id: QUESTION_IDS[3], prompt: "What are your typical rates?" },
    ],
  },
  es: {
    title: "Tu entrevista con Jick",
    consentTitle: "Antes de empezar",
    consentBody:
      "Jick graba esta conversación para crear tu perfil. Las grabaciones son privadas, se conservan 90 días por defecto y puedes borrarlas cuando quieras.",
    consentAccept: "Doy mi consentimiento para ser grabado",
    languageLabel: "Idioma de la entrevista",
    modeVoice: "Hablarlo",
    modeText: "Escribir",
    start: "Empezar",
    recording: "Escuchando…",
    pause: "Pausar",
    resume: "Reanudar",
    finish: "Finalizar y previsualizar",
    transcriptEmpty: "Tus respuestas aparecerán aquí mientras hablas.",
    recovered: "Restauramos tu entrevista en curso.",
    previewTitle: "Revisa tu perfil",
    publish: "Publicar perfil",
    saveDraft: "Guardar borrador",
    questions: [
      { id: QUESTION_IDS[0], prompt: "¿En qué nicho o temas creas contenido?" },
      { id: QUESTION_IDS[1], prompt: "¿Quién es tu audiencia?" },
      { id: QUESTION_IDS[2], prompt: "¿Cómo describirías tu estilo y tu voz?" },
      { id: QUESTION_IDS[3], prompt: "¿Cuáles son tus tarifas habituales?" },
    ],
  },
};

export function getOnboardingCopy(locale: Locale): OnboardingCopy {
  return copy[locale];
}
