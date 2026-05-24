"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

type ProductFormProps = {
  product?: Product;
};

const categories = [
  { value: "ready", label: "Pronta entrega" },
  { value: "drop", label: "Drop" },
  { value: "custom", label: "Sob demanda" },
];

const badges = ["Pronta entrega", "Sob demanda", "Atacado", "Novo", "Edição limitada", "Best seller", "Novo drop", "Profissões", "Utilitário"];

const fitOptions = ["Oversized", "Regular", "Slim", "Oversized premium", "Relaxado", "Reto", "A escolher", "Kit"];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    image: product?.image || "/produto-placeholder.png",
    images: product?.images || ([] as string[]),
    category: product?.category || "ready",
    badge: product?.badge || "Pronta entrega",
    fit: product?.fit || "Oversized",
    material: product?.material || "",
    color: product?.color || "Preto",
    sizes: product?.sizes?.join(", ") || "P, M, G, GG",
    stock: product?.stock || "Em estoque",
    launch: product?.launch ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const totalImages = form.images.length + files.length;
    if (totalImages > 4) {
      setError("Máximo de 4 imagens por produto");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao fazer upload");
        return;
      }

      const newImages = [...form.images, ...data.urls];
      setForm((prev) => ({
        ...prev,
        images: newImages,
        image: prev.image === "/produto-placeholder.png" ? newImages[0] : prev.image,
      }));
    } catch {
      setError("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      images: newImages,
      image: newImages.length > 0 ? newImages[0] : "/produto-placeholder.png",
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        image: form.images.length > 0 ? form.images[0] : form.image.trim(),
        images: form.images,
        category: form.category,
        badge: form.badge,
        fit: form.fit,
        material: form.material.trim(),
        color: form.color.trim(),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        stock: form.stock.trim(),
        launch: form.launch,
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
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = "Erro ao salvar";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          /* response might not be JSON */
        }
        setError(errorMsg);
        setSaving(false);
        return;
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setError("Erro de conexão ao salvar o produto");
    } finally {
      setSaving(false);
    }
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
        <Field label="Cor">
          <input
            type="text"
            value={form.color}
            onChange={(e) => updateField("color", e.target.value)}
            className="admin-input"
            placeholder="Preto"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tamanhos (vírgula)">
          <input
            type="text"
            value={form.sizes}
            onChange={(e) => updateField("sizes", e.target.value)}
            className="admin-input"
            placeholder="P, M, G, GG"
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
        <Field label="Lançamento">
          <div className="flex h-[42px] items-center">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold normal-case text-neutral-300">
              <input
                type="checkbox"
                checked={form.launch}
                onChange={(e) => updateField("launch", e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 accent-white"
              />
              Marcar como lançamento
            </label>
          </div>
        </Field>
      </div>

      {/* Image upload */}
      <div>
        <p className="text-xs font-black uppercase text-neutral-400">Imagens do produto (até 4)</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.images.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/5">
              <Image src={url} alt={`Imagem ${index + 1}`} fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                ✕
              </button>
              {index === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-black text-black">
                  Principal
                </span>
              ) : null}
            </div>
          ))}
          {form.images.length < 4 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/10 text-neutral-500 transition-colors hover:border-white/30 hover:text-neutral-300 disabled:opacity-50"
            >
              {uploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <span className="text-2xl">+</span>
                  <span className="text-[10px] font-bold uppercase">Adicionar</span>
                </>
              )}
            </button>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </div>

      {error ? (
        <p className="text-sm font-bold text-red-400">{error}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
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
