import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, createSession, sessionCookieOptions } from "../../../../lib/auth";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let password: unknown;
  try { ({ password } = await request.json()); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (typeof password !== "string" || password.length > 1024) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const configured = process.env.AUTH_PASSWORD_HASH;
  if (!configured) return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
  const [salt, hash, ...extra] = configured.split(":");
  if (extra.length || !salt || !/^[a-f0-9]{128}$/i.test(hash || "")) {
    return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
  }
  const supplied = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (!timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let session: string;
  try { session = createSession(); }
  catch { return NextResponse.json({ error: "Authentication not configured" }, { status: 503 }); }
  const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, session, sessionCookieOptions);
  return response;
}
