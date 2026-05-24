import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kromalab2026";
const SESSION_COOKIE = "kromalab-admin-session";
const SESSION_TOKEN = "authenticated";

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    return session?.value === SESSION_TOKEN;
  } catch {
    return false;
  }
}
