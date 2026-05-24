import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateMaterial, deleteMaterial } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const material = await updateMaterial(id, body);
    if (!material) {
      return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
    }
    return NextResponse.json(material);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const deleted = await deleteMaterial(id);
    if (!deleted) {
      return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao excluir material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
