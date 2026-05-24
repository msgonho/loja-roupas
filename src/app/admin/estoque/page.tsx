"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { Material } from "@/lib/data";
import { currency } from "@/lib/products";

const materialCategories = ["Tintas", "Rolos", "Pó DTF", "Filmes", "Tecidos", "Embalagens", "Outros"];

const units = ["ml", "L", "g", "kg", "un", "m", "m²", "rolo", "folha"];

const categoryColors: Record<string, string> = {
  Tintas: "bg-blue-500/20 text-blue-400",
  Rolos: "bg-green-500/20 text-green-400",
  "Pó DTF": "bg-yellow-500/20 text-yellow-400",
  Filmes: "bg-purple-500/20 text-purple-400",
  Tecidos: "bg-pink-500/20 text-pink-400",
  Embalagens: "bg-orange-500/20 text-orange-400",
  Outros: "bg-neutral-500/20 text-neutral-400",
};

type FormState = {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  minStock: string;
  costPerUnit: string;
};

const emptyForm: FormState = {
  name: "",
  category: materialCategories[0],
  unit: "un",
  quantity: "0",
  minStock: "0",
  costPerUnit: "0",
};

export default function AdminEstoquePage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetch("/api/materials", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMaterials(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function startEdit(mat: Material) {
    setForm({
      name: mat.name,
      category: mat.category,
      unit: mat.unit,
      quantity: mat.quantity.toString(),
      minStock: mat.minStock.toString(),
      costPerUnit: mat.costPerUnit.toString(),
    });
    setEditingId(mat.id);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Preencha o nome do material");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      quantity: parseFloat(form.quantity) || 0,
      minStock: parseFloat(form.minStock) || 0,
      costPerUnit: parseFloat(form.costPerUnit) || 0,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/materials/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setMaterials((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
          resetForm();
        } else {
          const data = await res.json();
          setError(data.error || "Erro ao salvar");
        }
      } else {
        const res = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setMaterials((prev) => [...prev, created]);
          resetForm();
        } else {
          const data = await res.json();
          setError(data.error || "Erro ao criar");
        }
      }
    } catch {
      setError("Erro de conexão");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este material?")) return;
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch {
      /* ignore */
    }
  }

  async function handleAdjustStock(id: string, adjustment: number) {
    const mat = materials.find((m) => m.id === id);
    if (!mat) return;
    const newQty = Math.max(0, mat.quantity + adjustment);
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMaterials((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
    } catch {
      /* ignore */
    }
  }

  const filtered = materials.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || m.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockCount = materials.filter((m) => m.quantity <= m.minStock && m.minStock > 0).length;
  const totalValue = materials.reduce((sum, m) => sum + m.quantity * m.costPerUnit, 0);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">Inventário</p>
          <h1 className="mt-1 text-3xl font-black uppercase text-white">
            Estoque
            <span className="ml-2 text-neutral-500">({materials.length})</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-md bg-white px-4 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
        >
          + Novo material
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase text-neutral-500">Total de itens</p>
          <p className="mt-1 text-2xl font-black text-white">{materials.length}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase text-neutral-500">Estoque baixo</p>
          <p className={`mt-1 text-2xl font-black ${lowStockCount > 0 ? "text-red-400" : "text-green-400"}`}>
            {lowStockCount}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase text-neutral-500">Valor total</p>
          <p className="mt-1 text-2xl font-black text-white">{currency.format(totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input max-w-xs"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="admin-input max-w-[200px]"
        >
          <option value="all">Todas categorias</option>
          {materialCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm ? (
        <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-black uppercase text-neutral-400">
            {editingId ? "Editar material" : "Novo material"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Nome
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                placeholder="Ex: Tinta preta DTG"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Categoria
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="admin-input"
              >
                {materialCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Unidade
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="admin-input"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Quantidade atual
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Estoque mínimo
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Custo por unidade (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                className="admin-input"
              />
            </label>
          </div>
          {error ? <p className="mt-3 text-sm font-bold text-red-400">{error}</p> : null}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-md bg-white px-5 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-white/10 px-5 py-2 text-xs font-black uppercase text-neutral-400 transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {/* List */}
      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">
            {materials.length === 0 ? "Nenhum material cadastrado." : "Nenhum material encontrado."}
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-black uppercase text-neutral-500">
                <th className="p-3">Material</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Quantidade</th>
                <th className="p-3 text-right">Mín.</th>
                <th className="p-3 text-right">Custo/un</th>
                <th className="p-3 text-right">Valor total</th>
                <th className="p-3 text-center">Ajustar</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mat) => {
                const isLow = mat.minStock > 0 && mat.quantity <= mat.minStock;
                return (
                  <tr key={mat.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{mat.name}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${categoryColors[mat.category] || "bg-white/10 text-neutral-400"}`}
                      >
                        {mat.category}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-bold ${isLow ? "text-red-400" : "text-white"}`}>
                      {mat.quantity} {mat.unit}
                      {isLow ? <span className="ml-1 text-[10px]">⚠️</span> : null}
                    </td>
                    <td className="p-3 text-right text-neutral-500">
                      {mat.minStock} {mat.unit}
                    </td>
                    <td className="p-3 text-right text-neutral-400">{currency.format(mat.costPerUnit)}</td>
                    <td className="p-3 text-right font-bold text-white">
                      {currency.format(mat.quantity * mat.costPerUnit)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(mat.id, -1)}
                          className="rounded border border-white/10 px-2 py-0.5 text-xs font-bold text-neutral-300 hover:bg-white/10"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(mat.id, 1)}
                          className="rounded border border-white/10 px-2 py-0.5 text-xs font-bold text-neutral-300 hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(mat)}
                          className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(mat.id)}
                          className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
