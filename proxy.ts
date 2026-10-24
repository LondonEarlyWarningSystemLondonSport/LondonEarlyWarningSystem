import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "./lib/auth";

// Next.js 16 proxy runs before pages and API handlers.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const allowed = path === "/login" || path === "/api/auth/login" || path === "/api/auth/logout";
  if (allowed) return NextResponse.next();

  let authenticated = false;
  try { authenticated = verifySession(request.cookies.get(COOKIE_NAME)?.value); }
  catch { authenticated = false; }
  if (authenticated) return NextResponse.next();

  if (path.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Authentication required" }, {
      status: 401, headers: { "Cache-Control": "no-store" },
    });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
