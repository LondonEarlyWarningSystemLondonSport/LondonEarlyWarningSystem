import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "lews_session";
const SESSION_SECONDS = 8 * 60 * 60;

function secret(): string {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SESSION_SECRET must be at least 32 characters");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(): string {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expiry = Number(parts[1]);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const supplied = Buffer.from(parts[2]);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
};
