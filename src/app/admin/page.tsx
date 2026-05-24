"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      fetch("/api/products", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/orders", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([p, o]) => {
        setProducts(Array.isArray(p) ? p : []);
        setOrders(Array.isArray(o) ? o : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const recentOrders = orders.slice(0, 8);

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
          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Produtos"
              value={products.length}
              detail={`${readyProducts} prontos · ${customProducts} sob demanda`}
              href="/admin/produtos"
            />
            <StatCard
              label="Pedidos"
              value={orders.length}
              detail={pendingOrders > 0 ? `${pendingOrders} pendente(s)` : "Nenhum pendente"}
              href="/admin/pedidos"
            />
            <StatCard
              label="Receita total"
              value={currency.format(totalRevenue)}
              detail="Excluindo cancelados"
            />
            <StatCard
              label="Ticket médio"
              value={
                orders.length > 0
                  ? currency.format(totalRevenue / orders.filter((o) => o.status !== "cancelado").length || 0)
                  : "—"
              }
              detail="Por pedido"
            />
          </div>

          {/* Status breakdown */}
          {orders.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-black uppercase text-neutral-400">
                Pipeline de pedidos
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(
                  [
                    ["pendente", "bg-yellow-500/20", "text-yellow-400"],
                    ["confirmado", "bg-blue-500/20", "text-blue-400"],
                    ["produção", "bg-purple-500/20", "text-purple-400"],
                    ["enviado", "bg-cyan-500/20", "text-cyan-400"],
                    ["entregue", "bg-green-500/20", "text-green-400"],
                    ["cancelado", "bg-red-500/20", "text-red-400"],
                  ] as const
                ).map(([status, bg, text]) => (
                  <div key={status} className={`rounded-md ${bg} p-3 text-center`}>
                    <p className={`text-xl font-black ${text}`}>
                      {statusCounts[status] || 0}
                    </p>
                    <p className="mt-1 text-xs font-bold capitalize text-neutral-400">
                      {status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recent orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-black uppercase text-neutral-400">
                Últimos pedidos
              </h2>
              {orders.length > 0 ? (
                <Link
                  href="/admin/pedidos"
                  className="text-xs font-bold text-neutral-500 transition-colors hover:text-white"
                >
                  Ver todos →
                </Link>
              ) : null}
            </div>
            {recentOrders.length === 0 ? (
              <div className="mt-3 rounded-md border border-dashed border-white/10 p-8 text-center">
                <p className="text-sm font-bold text-neutral-500">
                  Nenhum pedido ainda.
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Os pedidos feitos no checkout aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-md border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Itens</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-neutral-300 transition-colors hover:bg-white/5">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="font-bold text-white hover:underline"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{order.customer.name}</td>
                        <td className="px-4 py-3">{order.items.length}</td>
                        <td className="px-4 py-3 font-bold">
                          {currency.format(order.total)}
                        </td>
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

          {/* Quick actions */}
          <div className="mt-8">
            <h2 className="text-sm font-black uppercase text-neutral-400">
              Ações rápidas
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Link
                href="/admin/produtos/novo"
                className="rounded-md border border-white/10 bg-white/5 p-4 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10"
              >
                + Adicionar produto
              </Link>
              <Link
                href="/admin/pedidos"
                className="rounded-md border border-white/10 bg-white/5 p-4 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10"
              >
                Gerenciar pedidos
              </Link>
              <Link
                href="/admin/configuracoes"
                className="rounded-md border border-white/10 bg-white/5 p-4 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10"
              >
                Editar configurações
              </Link>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string | number;
  detail: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-black uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-neutral-400">{detail}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-md border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4">{content}</div>
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
