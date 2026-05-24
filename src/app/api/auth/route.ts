import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setSessionCookie, clearSessionCookie, isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return setSessionCookie(response);
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
