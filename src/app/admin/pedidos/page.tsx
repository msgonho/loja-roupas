"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import type { Order } from "@/lib/data";
import { currency } from "@/lib/products";

const PAGE_SIZE = 15;

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const result = orders.filter((o) => {
      const matchesStatus = filter === "todos" || o.status === filter;
      const matchesSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        (o.trackingCode || "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortBy === "total") {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
      }
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

    return result;
  }, [orders, filter, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [prevFilter, setPrevFilter] = useState(filter);
  const [prevSearch, setPrevSearch] = useState(search);
  if (filter !== prevFilter || search !== prevSearch) {
    setPrevFilter(filter);
    setPrevSearch(search);
    setPage(1);
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === "pendente").length;
  const productionCount = orders.filter((o) => o.status === "produção").length;
  const shippedCount = orders.filter((o) => o.status === "enviado").length;

  function exportAll() {
    const header = "Código,Cliente,E-mail,WhatsApp,Status,Total,Pagamento,Rastreio,Data\n";
    const rows = filtered.map((o) =>
      [o.id, o.customer.name, o.customer.email, o.customer.whatsapp, o.status, o.total.toFixed(2), o.payment, o.trackingCode || "", new Date(o.createdAt).toLocaleDateString("pt-BR")].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos-kromalab.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSort(field: "date" | "total") {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">Gestão</p>
          <h1 className="mt-1 text-3xl font-black uppercase text-white">
            Pedidos
            <span className="ml-2 text-neutral-500">({filtered.length})</span>
          </h1>
        </div>
        {orders.length > 0 ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={exportAll}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-400 transition-colors hover:bg-white/10"
            >
              Exportar CSV
            </button>
            <div className="text-right">
              <p className="text-lg font-black text-white">{currency.format(totalRevenue)}</p>
              <p className="text-xs font-bold text-neutral-500">Receita total</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* KPIs */}
      {orders.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-xl font-black text-white">{orders.length}</p>
            <p className="text-[10px] font-black uppercase text-neutral-500">Total pedidos</p>
          </div>
          <div className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3">
            <p className="text-xl font-black text-yellow-400">{pendingCount}</p>
            <p className="text-[10px] font-black uppercase text-neutral-500">Pendentes</p>
          </div>
          <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-3">
            <p className="text-xl font-black text-purple-400">{productionCount}</p>
            <p className="text-[10px] font-black uppercase text-neutral-500">Em produção</p>
          </div>
          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3">
            <p className="text-xl font-black text-cyan-400">{shippedCount}</p>
            <p className="text-[10px] font-black uppercase text-neutral-500">Enviados</p>
          </div>
        </div>
      ) : null}

      {/* Search */}
      <div className="mt-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, nome, e-mail ou rastreio..."
          className="admin-input max-w-sm"
        />
      </div>

      {/* Status filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        {["todos", "pendente", "confirmado", "produção", "enviado", "entregue", "cancelado"].map(
          (status) => {
            const count =
              status === "todos"
                ? orders.length
                : orders.filter((o) => o.status === status).length;
            return (
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
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          },
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : paginated.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">
            {search || filter !== "todos"
              ? "Nenhum pedido encontrado com esses filtros."
              : "Nenhum pedido registrado."}
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Os pedidos feitos no checkout da loja aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="hidden px-4 py-3 sm:table-cell">E-mail</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="cursor-pointer px-4 py-3 transition-colors hover:text-white" onClick={() => toggleSort("total")}>
                    Total {sortBy === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Rastreio</th>
                  <th className="cursor-pointer px-4 py-3 transition-colors hover:text-white" onClick={() => toggleSort("date")}>
                    Data {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((order) => (
                  <tr
                    key={order.id}
                    className="text-neutral-300 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-bold text-white">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{order.customer.name}</p>
                      <p className="text-xs text-neutral-500">{order.customer.whatsapp}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-400 sm:table-cell">
                      {order.customer.email}
                    </td>
                    <td className="px-4 py-3">{order.items.length}</td>
                    <td className="px-4 py-3 font-bold">{currency.format(order.total)}</td>
                    <td className="px-4 py-3 text-xs capitalize">{order.payment}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-black capitalize ${statusColors[order.status] || "bg-white/10 text-neutral-400"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell">
                      {order.trackingCode || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
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

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs font-bold text-neutral-500">
                Página {page} de {totalPages} · {filtered.length} pedido(s)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  Próxima →
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
