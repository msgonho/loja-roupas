"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

type ProductFormProps = {
  product?: Product;
};

const categories = [
  { value: "ready", label: "Pronta entrega" },
  { value: "custom", label: "Sob demanda" },
];

const badges = ["Pronta entrega", "Sob demanda", "Atacado", "Novo", "Edição limitada"];

const fitOptions = ["Oversized", "Regular", "Slim", "Oversized premium"];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    image: product?.image || "/produto-placeholder.png",
    category: product?.category || "ready",
    badge: product?.badge || "Pronta entrega",
    fit: product?.fit || "Oversized",
    material: product?.material || "",
    sizes: product?.sizes?.join(", ") || "P, M, G, GG",
    stock: product?.stock || "Em estoque",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      image: form.image.trim(),
      category: form.category,
      badge: form.badge,
      fit: form.fit,
      material: form.material.trim(),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      stock: form.stock.trim(),
    };

    if (!payload.name || !payload.slug || !payload.price) {
      setError("Preencha nome, slug e preço");
      setSaving(false);
      return;
    }

    const url = isEditing ? `/api/products/${product.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/produtos");
      router.refresh();
    } else {
      const data = await response.json();
      setError(data.error || "Erro ao salvar");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do produto">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="admin-input"
            placeholder="Ex: Oversized KromaLab Black"
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="admin-input"
            placeholder="oversized-kromalab-black"
          />
        </Field>
      </div>

      <Field label="Descrição">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="admin-input resize-none"
          placeholder="Descrição do produto..."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Preço (R$)">
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className="admin-input"
            placeholder="129.90"
          />
        </Field>
        <Field label="Categoria">
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="admin-input"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Badge">
          <select
            value={form.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            className="admin-input"
          >
            {badges.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Caimento">
          <select
            value={form.fit}
            onChange={(e) => updateField("fit", e.target.value)}
            className="admin-input"
          >
            {fitOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material">
          <input
            type="text"
            value={form.material}
            onChange={(e) => updateField("material", e.target.value)}
            className="admin-input"
            placeholder="Algodão 30.1 penteado"
          />
        </Field>
        <Field label="Estoque">
          <input
            type="text"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            className="admin-input"
            placeholder="Em estoque"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tamanhos (separados por vírgula)">
          <input
            type="text"
            value={form.sizes}
            onChange={(e) => updateField("sizes", e.target.value)}
            className="admin-input"
            placeholder="P, M, G, GG"
          />
        </Field>
        <Field label="Caminho da imagem">
          <input
            type="text"
            value={form.image}
            onChange={(e) => updateField("image", e.target.value)}
            className="admin-input"
            placeholder="/produtos/imagem.png"
          />
        </Field>
      </div>

      {error ? (
        <p className="text-sm font-bold text-red-400">{error}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-white px-5 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
        >
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produtos")}
          className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-black uppercase text-neutral-400 transition-colors hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
      {label}
      {children}
    </label>
  );
}
