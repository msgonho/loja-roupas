import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deductMaterials } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
    }
    const result = await deductMaterials(body.items);
    if (!result.success) {
      return NextResponse.json({ error: "Estoque insuficiente", errors: result.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao descontar materiais";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
