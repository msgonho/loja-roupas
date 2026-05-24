import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getMaterials, createMaterial } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const materials = await getMaterials();
    return NextResponse.json(materials);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar materiais";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.name || !body.category || !body.unit) {
      return NextResponse.json({ error: "Nome, categoria e unidade são obrigatórios" }, { status: 400 });
    }
    const material = await createMaterial({
      name: body.name,
      category: body.category,
      unit: body.unit,
      quantity: body.quantity ?? 0,
      minStock: body.minStock ?? 0,
      costPerUnit: body.costPerUnit ?? 0,
    });
    return NextResponse.json(material, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar material";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
