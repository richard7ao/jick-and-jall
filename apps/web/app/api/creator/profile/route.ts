import { getRepositories } from "@jj/db";

import { getSession, handleError, json } from "@/lib/server/api";
import { requireRole } from "@jj/auth";

interface ProfileBody {
  locale?: string;
  answers?: Record<string, string>;
  niche?: string;
  audience?: string;
  style?: string;
  rates?: string;
}

function toProfileFields(b: ProfileBody) {
  const a = b.answers ?? {};
  const niche = b.niche ?? a.niche ?? "";
  const style = b.style ?? a.style ?? "";
  return {
    displayName: "Creator",
    bio: style,
    niches: niche ? [niche] : [],
    platforms: [] as string[],
  };
}

async function save(request: Request, published: boolean): Promise<Response> {
  try {
    const session = requireRole(await getSession(), "creator");
    const b = (await request.json()) as ProfileBody;
    const profile = await getRepositories().creatorProfiles.upsert({
      uid: session.uid,
      locale: session.locale,
      published,
      available: true,
      ...toProfileFields(b),
    });
    return json({ ok: true, uid: profile.uid }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export function POST(request: Request): Promise<Response> {
  return save(request, true);
}

export function PUT(request: Request): Promise<Response> {
  return save(request, true);
}
