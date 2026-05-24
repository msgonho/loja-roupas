"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import type { AdminUser, Material } from "@/lib/data";

type FormItem = { name: string; price: string; quantity: string };
type MaterialUsage = { materialId: string; quantity: string };

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);

  const [customer, setCustomer] = useState({
    name: "", whatsapp: "", email: "", cep: "", city: "", address: "", number: "", complement: "",
  });
  const [cepLoading, setCepLoading] = useState(false);

  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCustomer((prev) => ({
          ...prev,
          address: [data.logradouro, data.bairro].filter(Boolean).join(", "),
          city: data.localidade ? `${data.localidade} / ${data.uf}` : prev.city,
        }));
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  }, []);
  const [items, setItems] = useState<FormItem[]>([{ name: "", price: "", quantity: "1" }]);
  const [payment, setPayment] = useState("pix");
  const [shippingMethod, setShippingMethod] = useState("Retirada");
  const [shippingPrice, setShippingPrice] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [assignee, setAssignee] = useState("");

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/materials", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMaterials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function addMaterialUsage() {
    setMaterialUsages((prev) => [...prev, { materialId: "", quantity: "1" }]);
  }

  function removeMaterialUsage(index: number) {
    setMaterialUsages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMaterialUsage(index: number, field: keyof MaterialUsage, value: string) {
    setMaterialUsages((prev) => prev.map((u, i) => (i === index ? { ...u, [field]: value } : u)));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", price: "", quantity: "1" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof FormItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const total = subtotal - (parseFloat(discount) || 0) + (parseFloat(shippingPrice) || 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!customer.name.trim()) { setError("Preencha o nome do cliente"); return; }
    if (items.some((i) => !i.name.trim() || !i.price)) { setError("Preencha todos os itens"); return; }

    setSaving(true);
    try {
      const payload = {
        items: items.map((item, i) => ({
          id: Date.now() + i,
          name: item.name.trim(),
          price: parseFloat(item.price) || 0,
          image: "/produto-placeholder.png",
          quantity: parseInt(item.quantity) || 1,
        })),
        customer: {
          name: customer.name.trim(),
          whatsapp: customer.whatsapp.trim(),
          email: customer.email.trim(),
          cep: customer.cep.trim(),
          city: customer.city.trim(),
          address: customer.address.trim(),
        },
        shipping: { method: shippingMethod, price: parseFloat(shippingPrice) || 0 },
        payment,
        subtotal,
        discount: parseFloat(discount) || 0,
        total,
        note: note.trim(),
        priority,
        assignee: assignee || undefined,
      };

      // Deduct materials from inventory
      const matItems = materialUsages
        .filter((u) => u.materialId && parseFloat(u.quantity) > 0)
        .map((u) => ({ materialId: u.materialId, quantity: parseFloat(u.quantity) }));

      if (matItems.length > 0) {
        const matRes = await fetch("/api/materials/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ items: matItems }),
        });
        if (!matRes.ok) {
          const matData = await matRes.json();
          setError(matData.errors?.join(", ") || matData.error || "Erro ao descontar materiais");
          setSaving(false);
          return;
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/pedidos");
      } else {
        let msg = "Erro ao criar pedido";
        try { const data = await res.json(); msg = data.error || msg; } catch { /* ignore */ }
        setError(msg);
      }
    } catch {
      setError("Erro de conexão");
    }
    setSaving(false);
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

      <p className="mt-4 text-xs font-black uppercase text-neutral-500">Novo</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Cadastrar pedido</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
        {/* Customer */}
        <section className="rounded-md border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-black uppercase text-neutral-400">Dados do cliente</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Nome *
              <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="admin-input" placeholder="Nome completo" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              WhatsApp
              <input type="text" value={customer.whatsapp} onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })} className="admin-input" placeholder="5511999999999" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              E-mail
              <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="admin-input" placeholder="email@exemplo.com" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              CEP
              <div className="relative">
                <input
                  type="text"
                  value={customer.cep}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomer({ ...customer, cep: val });
                    if (val.replace(/\D/g, "").length === 8) lookupCep(val);
                  }}
                  onBlur={() => lookupCep(customer.cep)}
                  className="admin-input w-full"
                  placeholder="00000-000"
                />
                {cepLoading ? <span className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : null}
              </div>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Cidade
              <input type="text" value={customer.city} readOnly className="admin-input opacity-60" placeholder="Preenchido pelo CEP" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Endereço (rua, bairro)
              <input type="text" value={customer.address} readOnly className="admin-input opacity-60" placeholder="Preenchido pelo CEP" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Número
              <input type="text" value={customer.number} onChange={(e) => setCustomer({ ...customer, number: e.target.value })} className="admin-input" placeholder="123" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Complemento
              <input type="text" value={customer.complement} onChange={(e) => setCustomer({ ...customer, complement: e.target.value })} className="admin-input" placeholder="Apto, bloco..." />
            </label>
          </div>
        </section>

        {/* Items */}
        <section className="rounded-md border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-neutral-400">Itens</h2>
            <button type="button" onClick={addItem} className="text-xs font-bold text-neutral-400 transition-colors hover:text-white">
              + Adicionar item
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_100px_80px_auto] items-end gap-2">
                <label className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                  Produto
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="admin-input text-sm"
                    placeholder="Nome do produto"
                  />
                </label>
                <label className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                  Preço
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    className="admin-input text-sm"
                    placeholder="0.00"
                  />
                </label>
                <label className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                  Qtd
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    className="admin-input text-sm"
                    placeholder="1"
                  />
                </label>
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mb-0.5 rounded-md border border-red-500/30 px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10"
                  >
                    ✕
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>
        </section>

        {/* Materials */}
        {materials.length > 0 ? (
          <section className="rounded-md border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase text-neutral-400">Materiais utilizados</h2>
              <button type="button" onClick={addMaterialUsage} className="text-xs font-bold text-neutral-400 transition-colors hover:text-white">
                + Adicionar material
              </button>
            </div>
            {materialUsages.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {materialUsages.map((usage, index) => {
                  const mat = materials.find((m) => m.id === usage.materialId);
                  return (
                    <div key={index} className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
                      <label className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                        Material
                        <select
                          value={usage.materialId}
                          onChange={(e) => updateMaterialUsage(index, "materialId", e.target.value)}
                          className="admin-input text-sm"
                        >
                          <option value="">Selecione...</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.quantity} {m.unit} disponível)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-[10px] font-black uppercase text-neutral-500">
                        Qtd {mat ? `(${mat.unit})` : ""}
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={usage.quantity}
                          onChange={(e) => updateMaterialUsage(index, "quantity", e.target.value)}
                          className="admin-input text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeMaterialUsage(index)}
                        className="mb-0.5 rounded-md border border-red-500/30 px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-neutral-500">Nenhum material adicionado. Clique em &quot;+ Adicionar material&quot; para descontar do estoque.</p>
            )}
          </section>
        ) : null}

        {/* Payment & Shipping */}
        <section className="rounded-md border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-black uppercase text-neutral-400">Pagamento e frete</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Pagamento
              <select value={payment} onChange={(e) => setPayment(e.target.value)} className="admin-input">
                <option value="pix">Pix</option>
                <option value="cartão">Cartão</option>
                <option value="boleto">Boleto</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferência">Transferência</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Método de envio
              <input
                type="text"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="admin-input"
                placeholder="Correios, retirada..."
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Frete (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Desconto (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="admin-input"
              />
            </label>
          </div>
        </section>

        {/* Priority & Assignee */}
        <section className="rounded-md border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-black uppercase text-neutral-400">Gestão</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Prioridade
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="admin-input">
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Responsável
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="admin-input">
                <option value="">Sem responsável</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Observação
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-input"
                placeholder="Nota sobre o pedido..."
              />
            </label>
          </div>
        </section>

        {/* Summary */}
        <div className="rounded-md border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-sm text-neutral-300">
            <span>Subtotal</span>
            <span className="font-bold text-white">R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-neutral-300">
            <span>Frete</span>
            <span>R$ {(parseFloat(shippingPrice) || 0).toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-neutral-300">
            <span>Desconto</span>
            <span>- R$ {(parseFloat(discount) || 0).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-lg">
            <span className="font-black text-white">Total</span>
            <span className="font-black text-white">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-white px-5 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar pedido"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/pedidos")}
            className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-black uppercase text-neutral-400 transition-colors hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
