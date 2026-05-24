"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import type { Order } from "@/lib/data";
import { currency } from "@/lib/products";

const allStatuses: Order["status"][] = [
  "pendente",
  "confirmado",
  "produção",
  "enviado",
  "entregue",
  "cancelado",
];

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400",
  confirmado: "bg-blue-500/20 text-blue-400",
  "produção": "bg-purple-500/20 text-purple-400",
  enviado: "bg-cyan-500/20 text-cyan-400",
  entregue: "bg-green-500/20 text-green-400",
  cancelado: "bg-red-500/20 text-red-400",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Pedido não encontrado");
        return r.json();
      })
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function changeStatus(status: Order["status"]) {
    setUpdating(true);
    const response = await fetch(`/api/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated = await response.json();
      setOrder(updated);
    }
    setUpdating(false);
  }

  return (
    <AdminShell>
      <button
        type="button"
        onClick={() => router.push("/admin/pedidos")}
        className="text-sm font-bold text-neutral-400 transition-colors hover:text-white"
      >
        ← Voltar aos pedidos
      </button>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : !order ? (
        <p className="mt-8 text-sm font-bold text-red-400">Pedido não encontrado.</p>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-black uppercase text-white">{order.id}</h1>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${statusColors[order.status] || "bg-white/10 text-neutral-400"}`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-neutral-500">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Cliente</h2>
              <div className="mt-3 grid gap-2 text-sm text-neutral-300">
                <p><span className="font-bold text-white">Nome:</span> {order.customer.name}</p>
                <p><span className="font-bold text-white">WhatsApp:</span> {order.customer.whatsapp}</p>
                <p><span className="font-bold text-white">E-mail:</span> {order.customer.email}</p>
                <p><span className="font-bold text-white">CEP:</span> {order.customer.cep}</p>
                <p><span className="font-bold text-white">Cidade:</span> {order.customer.city}</p>
                <p><span className="font-bold text-white">Endereço:</span> {order.customer.address}</p>
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Resumo</h2>
              <div className="mt-3 grid gap-2 text-sm text-neutral-300">
                <p><span className="font-bold text-white">Frete:</span> {order.shipping.method} — {order.shipping.price === 0 ? "Grátis" : currency.format(order.shipping.price)}</p>
                <p><span className="font-bold text-white">Pagamento:</span> {order.payment}</p>
                <p><span className="font-bold text-white">Subtotal:</span> {currency.format(order.subtotal)}</p>
                <p><span className="font-bold text-white">Desconto:</span> {currency.format(order.discount)}</p>
                <p className="text-lg"><span className="font-bold text-white">Total:</span> <span className="font-black text-white">{currency.format(order.total)}</span></p>
              </div>
              {order.note ? (
                <div className="mt-3 rounded-md bg-white/5 p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Observação</p>
                  <p className="mt-1 text-sm text-neutral-300">{order.note}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Itens do pedido</h2>
            <div className="mt-3 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/10">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500">Qtd: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-white">{currency.format(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Atualizar status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {allStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updating || order.status === status}
                  onClick={() => changeStatus(status)}
                  className={`rounded-md px-4 py-2 text-xs font-black capitalize transition-colors disabled:opacity-30 ${
                    order.status === status
                      ? "bg-white text-black"
                      : "border border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
