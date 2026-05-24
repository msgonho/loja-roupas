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
  { value: "custom", label: "Sob demanda" },
];

const badges = ["Pronta entrega", "Sob demanda", "Atacado", "Novo", "Edição limitada", "Best seller", "Profissões", "Utilitário"];

const availableSizes = ["PP", "P", "M", "G", "GG", "XGG", "36", "38", "40", "42", "44", "46", "10+", "30+", "50+"];
const availableColors = ["Preto", "Branco", "Cinza", "Grafite", "Marinho", "Verde", "Vermelho", "Rosé", "Bege", "Cáqui", "Personalizável"];

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
    costPrice: product?.costPrice?.toString() || "",
    image: product?.image || "/produto-placeholder.png",
    images: product?.images && product.images.length > 0
      ? product.images
      : product?.image && product.image !== "/produto-placeholder.png"
        ? [product.image]
        : ([] as string[]),
    category: product?.category || "ready",
    badge: product?.badge || "Pronta entrega",
    fit: product?.fit || "Oversized",
    material: product?.material || "",
    color: product?.color ? product.color.split(/[,;]+/).map((c) => c.trim()).filter(Boolean) : ["Preto"],
    sizes: product?.sizes || ["P", "M", "G", "GG"],
    pixDiscount: product?.pixDiscount?.toString() || "0",
    stock: product?.stock || "Em estoque",
    launch: product?.launch ?? false,
  });

  const salePrice = parseFloat(form.price) || 0;
  const costPriceVal = parseFloat(form.costPrice) || 0;
  const profitMargin = salePrice > 0 && costPriceVal > 0 ? ((salePrice - costPriceVal) / salePrice) * 100 : 0;
  const profitPerUnit = salePrice - costPriceVal;

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        costPrice: parseFloat(form.costPrice) || 0,
        image: form.images.length > 0 ? form.images[0] : form.image.trim(),
        images: form.images,
        category: form.category,
        badge: form.badge,
        fit: form.fit,
        material: form.material.trim(),
        color: form.color.join(", "),
        sizes: form.sizes,
        pixDiscount: parseFloat(form.pixDiscount) || 0,
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

      setSuccess(isEditing ? "Produto salvo com sucesso!" : "Produto criado com sucesso!");
      setTimeout(() => {
        router.push("/admin/produtos");
        router.refresh();
      }, 1500);
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
        <Field label="Preço de venda (R$)">
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
        <Field label="Custo de produção (R$)">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.costPrice}
            onChange={(e) => updateField("costPrice", e.target.value)}
            className="admin-input"
            placeholder="45.00"
          />
        </Field>
        <div className="grid gap-2">
          <span className="text-xs font-black uppercase text-neutral-400">Lucro estimado</span>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2.5">
            {costPriceVal > 0 ? (
              <>
                <span className={`text-sm font-black ${profitPerUnit > 0 ? "text-green-400" : "text-red-400"}`}>
                  R$ {profitPerUnit.toFixed(2)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${profitMargin > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-xs text-neutral-500">Preencha o custo</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
        <Field label="Exibir em">
          <select
            value={form.launch ? "lancamentos" : "colecao"}
            onChange={(e) => updateField("launch", e.target.value === "lancamentos")}
            className="admin-input"
          >
            <option value="colecao">Coleção</option>
            <option value="lancamentos">Lançamentos</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      {/* Sizes as tags */}
      <div>
        <p className="text-xs font-black uppercase text-neutral-400">Tamanhos disponíveis</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const selected = form.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    sizes: selected
                      ? prev.sizes.filter((s) => s !== size)
                      : [...prev.sizes, size],
                  }));
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  selected
                    ? "bg-white text-black"
                    : "border border-white/10 text-neutral-400 hover:bg-white/10"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors as tags */}
      <div>
        <p className="text-xs font-black uppercase text-neutral-400">Cores disponíveis</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const selected = form.color.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    color: selected
                      ? prev.color.filter((c) => c !== color)
                      : [...prev.color, color],
                  }));
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  selected
                    ? "bg-white text-black"
                    : "border border-white/10 text-neutral-400 hover:bg-white/10"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estoque">
          <input
            type="text"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            className="admin-input"
            placeholder="Em estoque"
          />
        </Field>
        <Field label="Desconto Pix (%)">
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            value={form.pixDiscount}
            onChange={(e) => updateField("pixDiscount", e.target.value)}
            className="admin-input"
            placeholder="5"
          />
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

      {success ? (
        <div className="rounded-md bg-green-500/20 border border-green-500/30 px-4 py-3 text-sm font-bold text-green-400">
          {success}
        </div>
      ) : null}

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
