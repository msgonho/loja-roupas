import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/data";
import type { AdminUser } from "@/lib/data";

function stripPassword(user: AdminUser): Omit<AdminUser, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...rest } = user;
  return rest;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const updates: Partial<Pick<AdminUser, "name" | "email" | "role" | "password">> = {};
    if (body.name) updates.name = body.name;
    if (body.email) updates.email = body.email;
    if (body.role) updates.role = body.role;
    if (body.password) updates.password = body.password;
    const user = await updateUser(id, updates);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json(stripPassword(user));
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
