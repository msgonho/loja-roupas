"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { Order } from "@/lib/data";
import type { Product } from "@/lib/products";
import { currency } from "@/lib/products";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(Array.isArray(o) ? o : []);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pendente").length;

  const readyProducts = products.filter((p) => p.category === "ready").length;
  const customProducts = products.filter((p) => p.category === "custom").length;

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <AdminShell>
      <p className="text-xs font-black uppercase text-neutral-500">Painel</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Dashboard</h1>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando dados...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Produtos" value={products.length} detail={`${readyProducts} prontos · ${customProducts} sob demanda`} />
            <StatCard label="Pedidos" value={orders.length} detail={pendingOrders > 0 ? `${pendingOrders} pendente(s)` : "Nenhum pendente"} />
            <StatCard label="Receita" value={currency.format(totalRevenue)} detail="Total (excl. cancelados)" />
            <StatCard
              label="Taxa de conclusão"
              value={
                orders.length > 0
                  ? `${Math.round((orders.filter((o) => o.status === "entregue").length / orders.length) * 100)}%`
                  : "—"
              }
              detail="Pedidos entregues"
            />
          </div>

          {orders.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-black uppercase text-neutral-400">Status dos pedidos</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {(["pendente", "confirmado", "produção", "enviado", "entregue", "cancelado"] as const).map(
                  (status) => (
                    <div
                      key={status}
                      className="rounded-md border border-white/10 bg-white/5 p-3 text-center"
                    >
                      <p className="text-lg font-black text-white">{statusCounts[status] || 0}</p>
                      <p className="mt-1 text-xs font-bold capitalize text-neutral-400">{status}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="text-sm font-black uppercase text-neutral-400">Últimos pedidos</h2>
            {orders.length === 0 ? (
              <p className="mt-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm font-bold text-neutral-400">
                Nenhum pedido registrado ainda.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-md border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="text-neutral-300">
                        <td className="px-4 py-3 font-bold text-white">{order.id}</td>
                        <td className="px-4 py-3">{order.customer.name}</td>
                        <td className="px-4 py-3 font-bold">{currency.format(order.total)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-neutral-400">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pendente: "bg-yellow-500/20 text-yellow-400",
    confirmado: "bg-blue-500/20 text-blue-400",
    "produção": "bg-purple-500/20 text-purple-400",
    enviado: "bg-cyan-500/20 text-cyan-400",
    entregue: "bg-green-500/20 text-green-400",
    cancelado: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-black capitalize ${colors[status] || "bg-white/10 text-neutral-400"}`}
    >
      {status}
    </span>
  );
}
