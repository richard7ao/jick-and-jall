import { getRepositories } from "@jj/db";
import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

interface BrandProfileBody {
  name?: string;
  sector?: string;
  values?: string;
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const session = requireRole(await getSession(), "brand");
    const b = (await request.json()) as BrandProfileBody;
    const profile = await getRepositories().brandProfiles.upsert({
      uid: session.uid,
      locale: session.locale,
      companyName: (b.name ?? "Brand").slice(0, 160) || "Brand",
      about: [b.sector, b.values].filter(Boolean).join(" — ").slice(0, 2000),
    });
    return json({ ok: true, uid: profile.uid });
  } catch (error) {
    return handleError(error);
  }
}
