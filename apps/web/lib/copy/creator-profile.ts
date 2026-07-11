import type { Locale } from "@/lib/i18n";

export interface CreatorProfileCopy {
  profileTitle: string;
  edit: string;
  save: string;
  published: string;
  recordingsTitle: string;
  recordingsEmpty: string;
  play: string;
  deleteRecording: string;
  privacyTitle: string;
  retentionNote: string;
  exportAccount: string;
  exportStarted: string;
  deleteSession: string;
  fields: { niche: string; audience: string; style: string; rates: string };
}

const copy: Record<Locale, CreatorProfileCopy> = {
  en: {
    profileTitle: "Your creator profile",
    edit: "Edit",
    save: "Save changes",
    published: "Profile saved.",
    recordingsTitle: "Your recordings",
    recordingsEmpty: "No recordings yet. Complete your interview to add one.",
    play: "Play",
    deleteRecording: "Delete",
    privacyTitle: "Privacy & data",
    retentionNote:
      "Recordings are private and deleted after 90 days by default. Deleting a session removes it here and upstream.",
    exportAccount: "Export my data",
    exportStarted: "Your export is being prepared.",
    deleteSession: "Delete this recording",
    fields: {
      niche: "Niche",
      audience: "Audience",
      style: "Style & voice",
      rates: "Rates",
    },
  },
  es: {
    profileTitle: "Tu perfil de creador",
    edit: "Editar",
    save: "Guardar cambios",
    published: "Perfil guardado.",
    recordingsTitle: "Tus grabaciones",
    recordingsEmpty: "Aún no hay grabaciones. Completa tu entrevista para añadir una.",
    play: "Reproducir",
    deleteRecording: "Eliminar",
    privacyTitle: "Privacidad y datos",
    retentionNote:
      "Las grabaciones son privadas y se eliminan tras 90 días por defecto. Eliminar una sesión la borra aquí y en origen.",
    exportAccount: "Exportar mis datos",
    exportStarted: "Tu exportación se está preparando.",
    deleteSession: "Eliminar esta grabación",
    fields: {
      niche: "Nicho",
      audience: "Audiencia",
      style: "Estilo y voz",
      rates: "Tarifas",
    },
  },
};

export function getCreatorProfileCopy(locale: Locale): CreatorProfileCopy {
  return copy[locale];
}
