import { endSession } from "@/lib/server/api";

function localeFrom(request: Request): string {
  const value = new URL(request.url).searchParams.get("locale");
  return value === "es" ? "es" : "en";
}

export async function GET(request: Request): Promise<Response> {
  await endSession();
  return Response.redirect(new URL(`/${localeFrom(request)}`, request.url), 303);
}
