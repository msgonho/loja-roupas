"use client";

import { useState } from "react";
import { products as defaultProducts, type Product } from "@/lib/products";

const STORAGE_KEY = "kromalab-products";

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return defaultProducts;
    
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    if (!savedProducts) return defaultProducts;
    
    try {
      return JSON.parse(savedProducts);
    } catch {
      return defaultProducts;
    }
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function saveProducts(updatedProducts: Product[]) {
    setProducts(updatedProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  }

  function handleProductClick(product: Product) {
    setEditingProduct(product);
  }

  function handleUpdateProduct(updatedProduct: Product | Omit<Product, "id">) {
    if ("id" in updatedProduct) {
      const updatedProducts = products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      saveProducts(updatedProducts);
      setEditingProduct(null);
    }
  }

  function handleCreateProduct(newProduct: Omit<Product, "id">) {
    const maxId = Math.max(...products.map((p) => p.id), 100);
    const product: Product = {
      ...newProduct,
      id: maxId + 1,
    };
    saveProducts([...products, product]);
    setIsCreating(false);
  }

  function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      saveProducts(updatedProducts);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Produtos</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-6 py-3 rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
        >
          + Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Material</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Estoque</th>
                <th className="px-6 py-3 text-right text-xs font-black uppercase text-neutral-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-20 overflow-hidden rounded bg-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black uppercase text-sm">{product.name}</p>
                    <p className="text-xs font-medium text-neutral-600">{product.badge}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-sm">R$ {product.price.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-black uppercase ${
                      product.category === "ready" ? "bg-green-100 text-green-800" :
                      product.category === "drop" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-neutral-600">{product.material}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-black uppercase ${
                      product.stock === "Baixo estoque" ? "bg-red-100 text-red-800" :
                      "bg-neutral-100 text-neutral-800"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className="text-red-600 text-xs font-black uppercase hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <ProductForm
          product={null}
          onSave={handleCreateProduct}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product | null;
  onSave: (product: Product | Omit<Product, "id">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(
    product || {
      slug: "",
      name: "",
      price: 0,
      image: "",
      badge: "",
      category: "ready" as const,
      fit: "",
      material: "",
      color: "",
      sizes: [] as string[],
      description: "",
      stock: "",
      launch: false,
    }
  );

  const [sizeInput, setSizeInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  function addSize() {
    if (sizeInput.trim()) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, sizeInput.trim()],
      });
      setSizeInput("");
    }
  }

  function removeSize(size: string) {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((s) => s !== size),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase">
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onCancel}
            className="text-2xl font-black hover:text-neutral-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-black uppercase mb-2">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black uppercase mb-2">Preço *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-2">Categoria *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <option value="ready">Pronta Entrega</option>
                <option value="drop">Drop</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">Slug (URL) *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              placeholder="nome-do-produto"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">URL da Imagem *</label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              placeholder="/imagem.png ou URL completa"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">Badge</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              placeholder="Ex: Novo, Best Seller"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black uppercase mb-2">Fit</label>
              <input
                type="text"
                value={formData.fit}
                onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-2">Material</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">Cor</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">Tamanhos</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                placeholder="Adicionar tamanho"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-black uppercase hover:bg-black"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded text-sm font-black"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2">Descrição</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black uppercase mb-2">Status de Estoque</label>
              <select
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <option value="Pronta entrega">Pronta entrega</option>
                <option value="Baixo estoque">Baixo estoque</option>
                <option value="Produção sob demanda">Produção sob demanda</option>
                <option value="Esgotado">Esgotado</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.launch}
                  onChange={(e) => setFormData({ ...formData, launch: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-black uppercase">Destacar em Lançamentos</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-neutral-300 rounded-lg text-sm font-black uppercase hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
            >
              {product ? "Salvar Alterações" : "Criar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
