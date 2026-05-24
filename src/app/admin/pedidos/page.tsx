"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import type { Order } from "@/lib/data";
import { currency } from "@/lib/products";

const PAGE_SIZE = 15;

const allStatuses: Order["status"][] = ["pendente", "confirmado", "produção", "enviado", "entregue", "cancelado"];

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "produção": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  enviado: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  entregue: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelado: "bg-red-500/20 text-red-400 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  urgente: "text-red-400",
  alta: "text-orange-400",
  normal: "text-neutral-400",
  baixa: "text-neutral-600",
};

const priorityLabels: Record<string, string> = {
  urgente: "🔴 Urgente",
  alta: "🟠 Alta",
  normal: "⚪ Normal",
  baixa: "⚫ Baixa",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "total" | "priority">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
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
        (o.trackingCode || "").toLowerCase().includes(search.toLowerCase()) ||
        (o.assignee || "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const priorityOrder = { urgente: 0, alta: 1, normal: 2, baixa: 3 };
    result.sort((a, b) => {
      if (sortBy === "total") {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
      }
      if (sortBy === "priority") {
        const pa = priorityOrder[a.priority || "normal"] ?? 2;
        const pb = priorityOrder[b.priority || "normal"] ?? 2;
        return sortDir === "asc" ? pa - pb : pb - pa;
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

  const totalRevenue = orders.filter((o) => o.status !== "cancelado").reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pendente").length;
  const productionCount = orders.filter((o) => o.status === "produção").length;
  const shippedCount = orders.filter((o) => o.status === "enviado").length;

  function exportAll() {
    const header = "Código,Cliente,E-mail,WhatsApp,Status,Prioridade,Responsável,Total,Pagamento,Rastreio,Data\n";
    const rows = filtered.map((o) =>
      [o.id, o.customer.name, o.customer.email, o.customer.whatsapp, o.status, o.priority || "normal", o.assignee || "", o.total.toFixed(2), o.payment, o.trackingCode || "", new Date(o.createdAt).toLocaleDateString("pt-BR")].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedidos-kromalab.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSort(field: "date" | "total" | "priority") {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  async function moveToStatus(orderId: string, newStatus: Order["status"]) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      }
    } catch { /* ignore */ }
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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pedidos/novo"
            className="rounded-md bg-white px-4 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
          >
            + Novo pedido
          </Link>
          {orders.length > 0 ? (
            <>
              <button
                type="button"
                onClick={exportAll}
                className="rounded-md border border-white/10 px-3 py-2.5 text-xs font-bold text-neutral-400 transition-colors hover:bg-white/10"
              >
                Exportar CSV
              </button>
              <div className="flex rounded-md border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 text-xs font-bold transition-colors ${viewMode === "table" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"}`}
                >
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-2 text-xs font-bold transition-colors ${viewMode === "kanban" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"}`}
                >
                  Kanban
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Revenue */}
      {orders.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-xl font-black text-white">{currency.format(totalRevenue)}</p>
            <p className="text-[10px] font-black uppercase text-neutral-500">Receita total</p>
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
          placeholder="Buscar por código, nome, e-mail, rastreio ou responsável..."
          className="admin-input max-w-sm"
        />
      </div>

      {/* Status filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        {["todos", ...allStatuses].map((status) => {
          const count = status === "todos" ? orders.length : orders.filter((o) => o.status === status).length;
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
              {status} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : orders.length === 0 && !search && filter === "todos" ? (
        <div className="mt-6 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">Nenhum pedido registrado.</p>
          <p className="mt-1 text-xs text-neutral-600">Crie um pedido manualmente ou aguarde pedidos do checkout.</p>
          <Link
            href="/admin/pedidos/novo"
            className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200"
          >
            + Criar primeiro pedido
          </Link>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="mt-4 flex gap-3 overflow-x-auto pb-4">
          {allStatuses.filter((s) => s !== "cancelado").map((status) => {
            const statusOrders = orders.filter((o) => o.status === status);
            const colors = statusColors[status] || "bg-white/10 text-neutral-400 border-white/10";
            return (
              <div key={status} className="w-64 shrink-0">
                <div className={`rounded-t-md border-b-2 px-3 py-2 text-xs font-black uppercase ${colors}`}>
                  {status} <span className="ml-1 opacity-60">{statusOrders.length}</span>
                </div>
                <div className="grid gap-2 rounded-b-md border border-t-0 border-white/10 bg-white/[0.02] p-2" style={{ minHeight: 100 }}>
                  {statusOrders.length === 0 ? (
                    <p className="p-3 text-center text-[10px] text-neutral-600">Vazio</p>
                  ) : (
                    statusOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/pedidos/${order.id}`}
                        className="block rounded-md border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{order.id}</span>
                          {order.priority && order.priority !== "normal" ? (
                            <span className={`text-[10px] font-bold ${priorityColors[order.priority]}`}>
                              {priorityLabels[order.priority]}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs font-bold text-neutral-300">{order.customer.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-black text-white">{currency.format(order.total)}</span>
                          <span className="text-[10px] text-neutral-500">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        {order.assignee ? (
                          <p className="mt-1 text-[10px] text-neutral-500">→ {order.assignee}</p>
                        ) : null}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : paginated.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">Nenhum pedido encontrado com esses filtros.</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="cursor-pointer px-4 py-3 transition-colors hover:text-white" onClick={() => toggleSort("total")}>
                    Total {sortBy === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="cursor-pointer px-4 py-3 transition-colors hover:text-white" onClick={() => toggleSort("priority")}>
                    Prioridade {sortBy === "priority" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="hidden px-4 py-3 lg:table-cell">Responsável</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Rastreio</th>
                  <th className="cursor-pointer px-4 py-3 transition-colors hover:text-white" onClick={() => toggleSort("date")}>
                    Data {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((order) => (
                  <tr key={order.id} className="text-neutral-300 transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{order.customer.name}</p>
                      <p className="text-xs text-neutral-500">{order.customer.whatsapp || order.customer.email}</p>
                    </td>
                    <td className="px-4 py-3">{order.items.length}</td>
                    <td className="px-4 py-3 font-bold">{currency.format(order.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => moveToStatus(order.id, e.target.value as Order["status"])}
                        className={`rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusColors[order.status]?.replace("border-", "border-") || "bg-white/10 text-neutral-400 border-white/10"}`}
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s} className="bg-[#101010] text-white">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${priorityColors[order.priority || "normal"]}`}>
                        {priorityLabels[order.priority || "normal"]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell">
                      {order.assignee || "—"}
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
