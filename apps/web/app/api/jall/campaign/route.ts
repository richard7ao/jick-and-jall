import { getRepositories } from "@jj/db";
import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

interface CampaignBody {
  answers?: Record<string, string>;
  goals?: string;
  audience?: string;
  deliverables?: string;
  budgetMinorUnits?: number;
}

function digitsToMinor(text: string | undefined): number {
  const digits = (text ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) * 100 : 0;
}

async function save(request: Request): Promise<Response> {
  try {
    const session = requireRole(await getSession(), "brand");
    const b = (await request.json()) as CampaignBody;
    const a = b.answers ?? {};
    const budgetMinor =
      typeof b.budgetMinorUnits === "number"
        ? b.budgetMinorUnits
        : digitsToMinor(a.budget);
    const repos = getRepositories();
    const campaign = await repos.campaigns.create({
      brandUid: session.uid,
      locale: session.locale,
      title: (b.goals ?? a.goals ?? "Campaign").slice(0, 160) || "Campaign",
      brief: b.deliverables ?? a.deliverables ?? "",
      budgetMinor,
    });
    await repos.campaigns.setStatus(campaign.id, "published");
    return json({ ok: true, id: campaign.id }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export function POST(request: Request): Promise<Response> {
  return save(request);
}

export function PUT(request: Request): Promise<Response> {
  return save(request);
}
