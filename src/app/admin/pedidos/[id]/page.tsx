"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import type { Order, AdminUser } from "@/lib/data";
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

const allPaymentStatuses = ["pendente", "pago", "orcamento", "desistencia", "reembolsado"] as const;
const paymentStatusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  orcamento: "Orçamento",
  desistencia: "Desistência",
  reembolsado: "Reembolsado",
};
const paymentStatusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400",
  pago: "bg-green-500/20 text-green-400",
  orcamento: "bg-blue-500/20 text-blue-400",
  desistencia: "bg-red-500/20 text-red-400",
  reembolsado: "bg-orange-500/20 text-orange-400",
};

const allPriorities = ["baixa", "normal", "alta", "urgente"] as const;
const priorityColors: Record<string, string> = {
  urgente: "bg-red-500/20 text-red-400",
  alta: "bg-orange-500/20 text-orange-400",
  normal: "bg-white/10 text-neutral-400",
  baixa: "bg-neutral-500/20 text-neutral-600",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "", whatsapp: "", email: "", cep: "", city: "", address: "",
  });
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Pedido não encontrado");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setTrackingCode(data.trackingCode || "");
        setInternalNotes(data.internalNotes || "");
        setCustomerForm(data.customer);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function patchOrder(updates: Record<string, unknown>) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        setOrder(updated);
        setTrackingCode(updated.trackingCode || "");
        setInternalNotes(updated.internalNotes || "");
        if (updated.customer) setCustomerForm(updated.customer);
      }
    } catch { /* ignore */ }
    setUpdating(false);
  }

  async function handleDelete() {
    if (!confirm("Excluir este pedido permanentemente?")) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        router.push("/admin/pedidos");
      }
    } catch { /* ignore */ }
    setUpdating(false);
  }

  function exportOrder() {
    if (!order) return;
    const lines = [
      `PEDIDO ${order.id}`,
      `Data: ${new Date(order.createdAt).toLocaleString("pt-BR")}`,
      `Status: ${order.status}`,
      order.trackingCode ? `Rastreio: ${order.trackingCode}` : "",
      "",
      "CLIENTE",
      `Nome: ${order.customer.name}`,
      `WhatsApp: ${order.customer.whatsapp}`,
      `E-mail: ${order.customer.email}`,
      `CEP: ${order.customer.cep}`,
      `Cidade: ${order.customer.city}`,
      `Endereço: ${order.customer.address}`,
      "",
      "ITENS",
      ...order.items.map((item, i) =>
        `${i + 1}. ${item.name} x${item.quantity} — ${currency.format(item.price * item.quantity)}`
      ),
      "",
      `Subtotal: ${currency.format(order.subtotal)}`,
      `Frete: ${order.shipping.method} — ${order.shipping.price === 0 ? "Grátis" : currency.format(order.shipping.price)}`,
      `Desconto: ${currency.format(order.discount)}`,
      `Pagamento: ${order.payment}`,
      `TOTAL: ${currency.format(order.total)}`,
      "",
      order.note ? `Observação do cliente: ${order.note}` : "",
      order.internalNotes ? `Notas internas: ${order.internalNotes}` : "",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-black uppercase text-white">{order.id}</h1>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${statusColors[order.status] || "bg-white/10 text-neutral-400"}`}
            >
              {order.status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <p className="text-sm font-bold text-neutral-500">
              {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>
            <button
              type="button"
              onClick={exportOrder}
              className="rounded-md border border-white/10 px-3 py-1 text-xs font-bold text-neutral-400 transition-colors hover:bg-white/10"
            >
              Exportar .txt
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={updating}
              className="rounded-md border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-30"
            >
              Excluir pedido
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Customer info */}
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-neutral-400">Cliente</h2>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(!editingCustomer)}
                  className="text-xs font-bold text-neutral-500 transition-colors hover:text-white"
                >
                  {editingCustomer ? "Cancelar" : "Editar"}
                </button>
              </div>
              {editingCustomer ? (
                <div className="mt-3 grid gap-2">
                  {(["name", "whatsapp", "email", "cep", "city", "address"] as const).map((field) => (
                    <label key={field} className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                      {field === "name" ? "Nome" : field === "whatsapp" ? "WhatsApp" : field === "email" ? "E-mail" : field === "cep" ? "CEP" : field === "city" ? "Cidade" : "Endereço"}
                      <input
                        type="text"
                        value={customerForm[field]}
                        onChange={(e) => setCustomerForm({ ...customerForm, [field]: e.target.value })}
                        className="admin-input text-sm"
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => { patchOrder({ customer: customerForm }); setEditingCustomer(false); }}
                    className="mt-2 rounded-md bg-white px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Salvar dados
                  </button>
                </div>
              ) : (
                <div className="mt-3 grid gap-2 text-sm text-neutral-300">
                  <p><span className="font-bold text-white">Nome:</span> {order.customer.name}</p>
                  <p><span className="font-bold text-white">WhatsApp:</span> {order.customer.whatsapp}</p>
                  <p><span className="font-bold text-white">E-mail:</span> {order.customer.email}</p>
                  <p><span className="font-bold text-white">CEP:</span> {order.customer.cep}</p>
                  <p><span className="font-bold text-white">Cidade:</span> {order.customer.city}</p>
                  <p><span className="font-bold text-white">Endereço:</span> {order.customer.address}</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Resumo</h2>
              <div className="mt-3 grid gap-2 text-sm text-neutral-300">
                <p><span className="font-bold text-white">Frete:</span> {order.shipping.method} — {order.shipping.price === 0 ? "Grátis" : currency.format(order.shipping.price)}</p>
                <p><span className="font-bold text-white">Pagamento:</span> {order.payment}</p>
                <p>
                  <span className="font-bold text-white">Status pagamento:</span>{" "}
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-black ${paymentStatusColors[order.paymentStatus || "pendente"] || ""}`}>
                    {paymentStatusLabels[order.paymentStatus || "pendente"] || order.paymentStatus || "Pendente"}
                  </span>
                </p>
                <p><span className="font-bold text-white">Subtotal:</span> {currency.format(order.subtotal)}</p>
                {order.costTotal ? <p><span className="font-bold text-white">Custo:</span> {currency.format(order.costTotal)}</p> : null}
                <p><span className="font-bold text-white">Desconto:</span> {currency.format(order.discount)}</p>
                <p className="text-lg"><span className="font-bold text-white">Total:</span> <span className="font-black text-white">{currency.format(order.total)}</span></p>
                {order.costTotal ? (
                  <p className="text-lg">
                    <span className="font-bold text-white">Lucro:</span>{" "}
                    <span className={`font-black ${order.total - order.costTotal > 0 ? "text-green-400" : "text-red-400"}`}>
                      {currency.format(order.total - order.costTotal)}
                    </span>
                  </p>
                ) : null}
              </div>
              {order.note ? (
                <div className="mt-3 rounded-md bg-white/5 p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Observação do cliente</p>
                  <p className="mt-1 text-sm text-neutral-300">{order.note}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Items */}
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Itens do pedido</h2>
            <div className="mt-3 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/10">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500">Qtd: {item.quantity} × {currency.format(item.price)}</p>
                  </div>
                  <p className="font-bold text-white">{currency.format(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Rastreio</h2>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Código de rastreio..."
                className="admin-input flex-1"
              />
              <button
                type="button"
                disabled={updating || trackingCode === (order.trackingCode || "")}
                onClick={() => patchOrder({ trackingCode })}
                className="rounded-md bg-white px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-30"
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Internal notes */}
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Notas internas</h2>
            <div className="mt-3">
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Anotações sobre este pedido (não visível pelo cliente)..."
                className="admin-input w-full resize-none"
              />
              <button
                type="button"
                disabled={updating || internalNotes === (order.internalNotes || "")}
                onClick={() => patchOrder({ internalNotes })}
                className="mt-2 rounded-md bg-white px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-30"
              >
                Salvar notas
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Status do pedido</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {allStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updating || order.status === status}
                  onClick={() => patchOrder({ status })}
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

          {/* Payment Status */}
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs font-black uppercase text-neutral-400">Status do pagamento</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {allPaymentStatuses.map((ps) => (
                <button
                  key={ps}
                  type="button"
                  disabled={updating || order.paymentStatus === ps}
                  onClick={() => patchOrder({ paymentStatus: ps })}
                  className={`rounded-md px-4 py-2 text-xs font-black transition-colors disabled:opacity-30 ${
                    order.paymentStatus === ps
                      ? paymentStatusColors[ps] || "bg-white text-black"
                      : "border border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {paymentStatusLabels[ps] || ps}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Assignee */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Prioridade</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {allPriorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={updating || (order.priority || "normal") === p}
                    onClick={() => patchOrder({ priority: p })}
                    className={`rounded-md px-4 py-2 text-xs font-black capitalize transition-colors disabled:opacity-30 ${
                      (order.priority || "normal") === p
                        ? priorityColors[p]
                        : "border border-white/10 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Responsável</h2>
              <div className="mt-3">
                <select
                  value={order.assignee || ""}
                  onChange={(e) => patchOrder({ assignee: e.target.value || undefined })}
                  disabled={updating}
                  className="admin-input w-full disabled:opacity-50"
                >
                  <option value="">Sem responsável</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 ? (
            <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-5">
              <h2 className="text-xs font-black uppercase text-neutral-400">Histórico</h2>
              <div className="mt-3 grid gap-3">
                {order.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-white/40" />
                      {i < order.timeline!.length - 1 ? (
                        <div className="w-px flex-1 bg-white/10" />
                      ) : null}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-bold text-neutral-300">{event.action}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(event.date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* WhatsApp link */}
          {order.customer.whatsapp ? (
            <div className="mt-4">
              <a
                href={`https://wa.me/${order.customer.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md bg-green-600 px-5 py-2.5 text-sm font-black uppercase text-white transition-colors hover:bg-green-700"
              >
                Contatar via WhatsApp
              </a>
            </div>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
