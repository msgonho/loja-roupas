"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import ProductForm from "@/components/ProductForm";
import type { Product } from "@/lib/products";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${params.id}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Produto não encontrado");
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  return (
    <AdminShell>
      <p className="text-xs font-black uppercase text-neutral-500">Catálogo</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Editar produto</h1>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : error ? (
        <p className="mt-8 text-sm font-bold text-red-400">{error}</p>
      ) : product ? (
        <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-5">
          <ProductForm product={product} />
        </div>
      ) : null}
    </AdminShell>
  );
}
