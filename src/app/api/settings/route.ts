import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar configurações";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const settings = await updateSettings(body);
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao salvar configurações";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
