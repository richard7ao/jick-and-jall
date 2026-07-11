import type { Locale } from "@/lib/i18n";

export interface BrandEditorsCopy {
  profileTitle: string;
  campaignTitle: string;
  save: string;
  publish: string;
  saved: string;
  published: string;
  brandName: string;
  sector: string;
  values: string;
  goals: string;
  audience: string;
  deliverables: string;
  budget: string;
  budgetHint: string;
  budgetError: string;
}

const copy: Record<Locale, BrandEditorsCopy> = {
  en: {
    profileTitle: "Brand profile",
    campaignTitle: "Campaign brief",
    save: "Save changes",
    publish: "Publish",
    saved: "Saved.",
    published: "Published.",
    brandName: "Brand name",
    sector: "Sector",
    values: "Brand values",
    goals: "Goals",
    audience: "Audience",
    deliverables: "Deliverables",
    budget: "Budget (GBP)",
    budgetHint: "£50–£10,000",
    budgetError: "Enter a whole amount between £50 and £10,000.",
  },
  es: {
    profileTitle: "Perfil de marca",
    campaignTitle: "Brief de campaña",
    save: "Guardar cambios",
    publish: "Publicar",
    saved: "Guardado.",
    published: "Publicado.",
    brandName: "Nombre de la marca",
    sector: "Sector",
    values: "Valores de la marca",
    goals: "Objetivos",
    audience: "Audiencia",
    deliverables: "Entregables",
    budget: "Presupuesto (GBP)",
    budgetHint: "£50–£10.000",
    budgetError: "Introduce un importe entero entre £50 y £10.000.",
  },
};

export function getBrandEditorsCopy(locale: Locale): BrandEditorsCopy {
  return copy[locale];
}

/** Deterministic budget validation. Returns GBP minor units, or null if invalid. */
export function parseBudgetGbp(input: string): number | null {
  if (!/^\d{1,6}$/.test(input.trim())) return null;
  const pounds = Number(input.trim());
  if (pounds < 50 || pounds > 10_000) return null;
  return pounds * 100;
}
