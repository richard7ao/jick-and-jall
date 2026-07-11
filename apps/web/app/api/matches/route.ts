import { getRepositories } from "@jj/db";
import { requireSession } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function GET(request: Request): Promise<Response> {
  try {
    const session = requireSession(await getSession());
    const role = new URL(request.url).searchParams.get("role");
    const repos = getRepositories();
    if (role === "brand") {
      const matches = await repos.matches.listForBrand(session.uid);
      // No numeric score and no creator catalog is exposed to the brand.
      return json(
        matches.map((m) => ({
          id: m.id,
          alias: "Creator",
          fitReason: "Strong fit for your brief.",
          status: m.disclosureConsented ? "accepted" : "awaiting_consent",
        })),
      );
    }
    const matches = await repos.matches.listForCreator(session.uid);
    return json(
      matches.map((m) => ({
        id: m.id,
        brandName: "A brand",
        fitReason: "Matches your profile.",
      })),
    );
  } catch (error) {
    return handleError(error);
  }
}
