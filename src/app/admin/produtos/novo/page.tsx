"use client";

import AdminShell from "@/components/AdminShell";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <AdminShell>
      <p className="text-xs font-black uppercase text-neutral-500">Catálogo</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Novo produto</h1>
      <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-5">
        <ProductForm />
      </div>
    </AdminShell>
  );
}
