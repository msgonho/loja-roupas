import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getOrders, createOrder } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar pedidos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
