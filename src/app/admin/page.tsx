"use client";

import Link from "next/link";
import { products } from "@/lib/products";

export default function AdminDashboard() {
  const lowStockItems = products.filter((p) => p.stock === "Baixo estoque");
  const totalProducts = products.length;
  const customProducts = products.filter((p) => p.category === "custom").length;
  const readyProducts = products.filter((p) => p.category !== "custom").length;

  return (
    <div>
      <h1 className="text-3xl font-black uppercase mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-neutral-500">Total de Produtos</p>
          <p className="text-4xl font-black mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-neutral-500">Pronta Entrega</p>
          <p className="text-4xl font-black mt-2">{readyProducts}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-neutral-500">Personalizados</p>
          <p className="text-4xl font-black mt-2">{customProducts}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6 shadow-sm border border-red-200">
          <p className="text-sm font-black uppercase text-red-600">Estoque Baixo</p>
          <p className="text-4xl font-black mt-2 text-red-600">{lowStockItems.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black uppercase">Itens com Estoque Baixo</h2>
          <Link
            href="/admin/estoque"
            className="text-sm font-black uppercase text-black hover:underline"
          >
            Ver Estoque Completo →
          </Link>
        </div>
        
        {lowStockItems.length === 0 ? (
          <p className="text-sm font-medium text-neutral-600">Nenhum item com estoque baixo.</p>
        ) : (
          <div className="grid gap-4">
            {lowStockItems.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-black uppercase">{product.name}</p>
                  <p className="text-sm font-medium text-neutral-600">{product.material}</p>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded">
                  {product.stock}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/pedidos"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-black uppercase mb-2">Gerenciar Pedidos</h3>
          <p className="text-sm font-medium text-neutral-600">Criar, editar e filtrar pedidos</p>
        </Link>
        <Link
          href="/admin/estoque"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-black uppercase mb-2">Gerenciar Estoque</h3>
          <p className="text-sm font-medium text-neutral-600">Controle de entrada e saída</p>
        </Link>
        <Link
          href="/admin/produtos"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-black uppercase mb-2">Gerenciar Produtos</h3>
          <p className="text-sm font-medium text-neutral-600">Editar cadastro de produtos</p>
        </Link>
      </div>
    </div>
  );
}
