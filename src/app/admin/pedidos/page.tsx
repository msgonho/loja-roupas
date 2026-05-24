"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import type { Order } from "@/lib/data";
import { currency } from "@/lib/products";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400",
  confirmado: "bg-blue-500/20 text-blue-400",
  "produção": "bg-purple-500/20 text-purple-400",
  enviado: "bg-cyan-500/20 text-cyan-400",
  entregue: "bg-green-500/20 text-green-400",
  cancelado: "bg-red-500/20 text-red-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminShell>
      <p className="text-xs font-black uppercase text-neutral-500">Gestão</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Pedidos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {["todos", "pendente", "confirmado", "produção", "enviado", "entregue", "cancelado"].map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                filter === status
                  ? "bg-white text-black"
                  : "border border-white/10 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {status}
              {status !== "todos" ? (
                <span className="ml-1.5 text-neutral-500">
                  {orders.filter((o) => o.status === status).length}
                </span>
              ) : (
                <span className="ml-1.5 text-neutral-500">{orders.length}</span>
              )}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-md border border-white/10 bg-white/5 p-6 text-center text-sm font-bold text-neutral-400">
          {filter === "todos" ? "Nenhum pedido registrado." : `Nenhum pedido com status "${filter}".`}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((order) => (
                <tr key={order.id} className="text-neutral-300">
                  <td className="px-4 py-3 font-bold text-white">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{order.customer.name}</p>
                    <p className="text-xs text-neutral-500">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-bold">{currency.format(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-black capitalize ${statusColors[order.status] || "bg-white/10 text-neutral-400"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
