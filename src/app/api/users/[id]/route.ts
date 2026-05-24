import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const user = await updateUser(id, body);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar usuário";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: "Não é possível excluir o único usuário" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao excluir usuário";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
