import { NextResponse, type NextRequest } from "next/server";

import { negotiateLocale, splitLocale } from "@/lib/i18n";

/**
 * Next.js 16 proxy (the successor to the middleware convention). Ensures every
 * user-facing route is prefixed with a supported locale: requests that already
 * carry a locale pass through untouched; the rest are redirected to the best
 * match from the Accept-Language header.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const { locale } = splitLocale(pathname);
  if (locale) return NextResponse.next();

  const chosen = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${chosen}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
