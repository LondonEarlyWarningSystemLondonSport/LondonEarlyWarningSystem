import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, sessionCookieOptions } from "../../../../lib/auth";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
