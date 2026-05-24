"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import type { Product } from "@/lib/products";
import { currency } from "@/lib/products";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/products", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.material.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "todos" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [prevSearch, setPrevSearch] = useState(search);
  const [prevCategory, setPrevCategory] = useState(categoryFilter);
  if (search !== prevSearch || categoryFilter !== prevCategory) {
    setPrevSearch(search);
    setPrevCategory(categoryFilter);
    setPage(1);
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">Catálogo</p>
          <h1 className="mt-1 text-3xl font-black uppercase text-white">
            Produtos
            <span className="ml-2 text-neutral-500">({filtered.length})</span>
          </h1>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-md bg-white px-4 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
        >
          + Novo produto
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, slug ou material..."
          className="admin-input max-w-sm"
        />
        <div className="flex gap-2">
          {[
            { value: "todos", label: "Todos" },
            { value: "ready", label: "Pronta entrega" },
            { value: "custom", label: "Sob demanda" },
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoryFilter(cat.value)}
              className={`rounded-md px-3 py-2.5 text-xs font-bold transition-colors ${
                categoryFilter === cat.value
                  ? "bg-white text-black"
                  : "border border-white/10 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : paginated.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">
            {search || categoryFilter !== "todos"
              ? "Nenhum produto encontrado com esses filtros."
              : "Nenhum produto cadastrado."}
          </p>
          <Link
            href="/admin/produtos/novo"
            className="mt-3 inline-block text-sm font-bold text-white underline"
          >
            Criar primeiro produto
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-black uppercase text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Material</th>
                  <th className="hidden px-4 py-3 md:table-cell">Tamanhos</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((product) => (
                  <tr
                    key={product.id}
                    className="text-neutral-300 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white/10">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white">{product.name}</p>
                          <p className="text-xs text-neutral-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          product.category === "ready"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {product.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {currency.format(product.price)}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-400 sm:table-cell">
                      {product.material}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-400 md:table-cell">
                      {product.sizes.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-xs">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-400 transition-colors hover:bg-white/10"
                          title="Ver na loja"
                        >
                          ↗
                        </Link>
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          Excluir
                        </button>
                      </div>
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
                Página {page} de {totalPages} · {filtered.length} produto(s)
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
