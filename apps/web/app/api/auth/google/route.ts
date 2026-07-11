function localeFrom(request: Request): string {
  const value = new URL(request.url).searchParams.get("locale");
  return value === "es" ? "es" : "en";
}

/**
 * Google sign-in entry point. The Firebase OAuth exchange is wired at
 * deployment; until then this routes back to the password form so the flow is
 * never a dead end.
 */
export function GET(request: Request): Response {
  const locale = localeFrom(request);
  return Response.redirect(new URL(`/${locale}/sign-in`, request.url), 303);
}
