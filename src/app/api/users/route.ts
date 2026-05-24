import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getUsers, createUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar usuários";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar usuário";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
