import { NextRequest, NextResponse } from "next/server";
import { isLocale, resolveLocale } from "./lib/i18n";

/**
 * Locale routing: every page lives under /<locale>/…. Requests without a
 * supported locale prefix are redirected to the best match from Accept-Language.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = resolveLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
