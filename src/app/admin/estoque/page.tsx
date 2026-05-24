"use client";

import { useState, useEffect } from "react";
import { products } from "@/lib/products";
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getOldestItems,
  getLowStockItems,
  getTotalStockByProduct,
  type InventoryItem,
} from "@/lib/inventory";

export default function EstoquePage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "oldest" | "low">("all");
  const [formData, setFormData] = useState({
    productId: 0,
    productName: "",
    quantity: 0,
    entryDate: new Date().toISOString().split("T")[0],
    batchNumber: "",
    notes: "",
  });

  useEffect(() => {
    loadInventory();
  }, [viewMode]);

  function loadInventory() {
    let items = getInventory();
    
    if (viewMode === "oldest") {
      items = getOldestItems(50);
    } else if (viewMode === "low") {
      const lowStockProducts = getLowStockItems(10);
      const lowStockIds = lowStockProducts.map(p => p.productId);
      items = items.filter(item => lowStockIds.includes(item.productId));
    }
    
    setInventory(items);
  }

  function handleAddItem() {
    if (!formData.productId || formData.quantity <= 0) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (!product) {
      alert("Produto não encontrado");
      return;
    }

    addInventoryItem({
      productId: formData.productId,
      productName: product.name,
      quantity: formData.quantity,
      entryDate: formData.entryDate,
      batchNumber: formData.batchNumber || undefined,
      notes: formData.notes || undefined,
    });

    setIsAdding(false);
    setFormData({
      productId: 0,
      productName: "",
      quantity: 0,
      entryDate: new Date().toISOString().split("T")[0],
      batchNumber: "",
      notes: "",
    });
    loadInventory();
  }

  function handleUpdateItem() {
    if (!editingItem) return;
    
    if (formData.quantity <= 0) {
      alert("Quantidade deve ser maior que zero");
      return;
    }

    updateInventoryItem(editingItem.id, {
      quantity: formData.quantity,
      entryDate: formData.entryDate,
      batchNumber: formData.batchNumber || undefined,
      notes: formData.notes || undefined,
    });

    setIsEditing(false);
    setEditingItem(null);
    setFormData({
      productId: 0,
      productName: "",
      quantity: 0,
      entryDate: new Date().toISOString().split("T")[0],
      batchNumber: "",
      notes: "",
    });
    loadInventory();
  }

  function handleDeleteItem(id: number) {
    if (confirm("Tem certeza que deseja excluir este item do estoque?")) {
      deleteInventoryItem(id);
      loadInventory();
    }
  }

  function handleEditItem(item: InventoryItem) {
    setEditingItem(item);
    setFormData({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      entryDate: item.entryDate.split("T")[0],
      batchNumber: item.batchNumber || "",
      notes: item.notes || "",
    });
    setIsEditing(true);
  }

  function handleProductChange(productId: string) {
    const id = parseInt(productId);
    const product = products.find(p => p.id === id);
    setFormData({
      ...formData,
      productId: id,
      productName: product?.name || "",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Estoque</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-black text-white px-6 py-3 rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
        >
          + Adicionar Entrada
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("all")}
          className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
            viewMode === "all" ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Todos os Itens
        </button>
        <button
          onClick={() => setViewMode("oldest")}
          className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
            viewMode === "oldest" ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Mais Antigos (FIFO)
        </button>
        <button
          onClick={() => setViewMode("low")}
          className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
            viewMode === "low" ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Estoque Baixo
        </button>
      </div>

      {/* Low Stock Summary */}
      {viewMode === "all" && (
        <div className="bg-red-50 rounded-lg p-6 mb-6 border border-red-200">
          <h2 className="text-lg font-black uppercase mb-4">Resumo de Estoque por Produto</h2>
          <div className="grid gap-3">
            {products.map((product) => {
              const totalStock = getTotalStockByProduct(product.id);
              const isLow = totalStock <= 5;
              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isLow ? "bg-red-100 border border-red-300" : "bg-white border border-neutral-200"
                  }`}
                >
                  <div>
                    <p className="font-black uppercase text-sm">{product.name}</p>
                    <p className="text-xs font-medium text-neutral-600">{product.material}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${isLow ? "text-red-600" : ""}`}>
                      {totalStock} unidades
                    </p>
                    {isLow && (
                      <p className="text-xs font-bold text-red-600 uppercase">Estoque Baixo</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-sm">
        {inventory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-neutral-600">
              {viewMode === "oldest" ? "Nenhum item no estoque" : "Nenhum item encontrado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Data de Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Lote</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase text-neutral-700">Observações</th>
                  <th className="px-6 py-3 text-right text-xs font-black uppercase text-neutral-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <p className="font-black uppercase text-sm">{item.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-sm">{item.quantity}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-600">
                        {new Date(item.entryDate).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-600">{item.batchNumber || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-600">{item.notes || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 text-xs font-black uppercase hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase">
                {isAdding ? "Adicionar Entrada" : "Editar Item"}
              </h2>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setEditingItem(null);
                  setFormData({
                    productId: 0,
                    productName: "",
                    quantity: 0,
                    entryDate: new Date().toISOString().split("T")[0],
                    batchNumber: "",
                    notes: "",
                  });
                }}
                className="text-2xl font-black hover:text-neutral-600"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              {isAdding && (
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Produto *</label>
                  <select
                    value={formData.productId || ""}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isEditing && (
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Produto</label>
                  <input
                    type="text"
                    value={formData.productName}
                    disabled
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium bg-neutral-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-black uppercase mb-2">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Data de Entrada *</label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Número do Lote</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Observações</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium resize-none"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setEditingItem(null);
                  setFormData({
                    productId: 0,
                    productName: "",
                    quantity: 0,
                    entryDate: new Date().toISOString().split("T")[0],
                    batchNumber: "",
                    notes: "",
                  });
                }}
                className="px-6 py-3 border border-neutral-300 rounded-lg text-sm font-black uppercase hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                onClick={isAdding ? handleAddItem : handleUpdateItem}
                className="px-6 py-3 bg-black text-white rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
              >
                {isAdding ? "Adicionar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
