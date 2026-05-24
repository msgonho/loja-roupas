"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder, getOrders, updateOrder, deleteOrder, restoreOrder, permanentlyDeleteOrder, type Order } from "@/lib/orders";
import { products } from "@/lib/products";

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    material: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    whatsapp: "",
    email: "",
    cep: "",
    city: "",
    address: "",
    items: [] as Array<{ id: number; name: string; price: number; quantity: number }>,
    shippingMethod: "standard",
    paymentMethod: "pix",
    material: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrders();
  }, [showTrash]);

  function loadOrders() {
    const allOrders = getOrders();
    const filtered = showTrash 
      ? allOrders.filter(o => o.deletedAt)
      : allOrders.filter(o => !o.deletedAt);
    
    let result = filtered;
    
    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }
    
    if (filters.material) {
      result = result.filter(o => o.material === filters.material);
    }
    
    setOrders(result);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      errors.customerName = "Nome é obrigatório";
    }
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = "WhatsApp é obrigatório";
    }
    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    }
    if (!formData.cep.trim()) {
      errors.cep = "CEP é obrigatório";
    }
    if (!formData.city.trim()) {
      errors.city = "Cidade é obrigatória";
    }
    if (!formData.address.trim()) {
      errors.address = "Endereço é obrigatório";
    }
    if (formData.items.length === 0) {
      errors.items = "Adicione pelo menos um item";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCreateOrder() {
    if (!validateForm()) {
      return;
    }

    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = formData.shippingMethod === "pickup" ? 0 : (subtotal >= 299 ? 0 : 18.9);
    const total = subtotal + shipping;

    createOrder({
      ...formData,
      subtotal,
      shipping,
      total,
      status: "pendente",
    });

    setIsCreating(false);
    setFormData({
      customerName: "",
      whatsapp: "",
      email: "",
      cep: "",
      city: "",
      address: "",
      items: [],
      shippingMethod: "standard",
      paymentMethod: "pix",
      material: "",
    });
    setValidationErrors({});
    loadOrders();
  }

  function handleUpdateOrder() {
    if (!selectedOrder) return;
    
    if (!validateForm()) {
      return;
    }

    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = formData.shippingMethod === "pickup" ? 0 : (subtotal >= 299 ? 0 : 18.9);
    const total = subtotal + shipping;

    updateOrder(selectedOrder.id, {
      ...formData,
      subtotal,
      shipping,
      total,
    });

    setIsEditing(false);
    setSelectedOrder(null);
    loadOrders();
  }

  function handleDeleteOrder(id: string) {
    if (confirm("Tem certeza que deseja mover este pedido para a lixeira?")) {
      deleteOrder(id);
      loadOrders();
    }
  }

  function handleRestoreOrder(id: string) {
    restoreOrder(id);
    loadOrders();
  }

  function handlePermanentlyDeleteOrder(id: string) {
    if (confirm("Tem certeza que deseja excluir este pedido permanentemente?")) {
      permanentlyDeleteOrder(id);
      loadOrders();
    }
  }

  function handleAddItem(productId: number) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = formData.items.find(i => i.id === productId);
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(i => 
          i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        }],
      });
    }
  }

  function handleRemoveItem(productId: number) {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.id !== productId),
    });
  }

  function handleEditOrder(order: Order) {
    setSelectedOrder(order);
    setFormData({
      customerName: order.customerName,
      whatsapp: order.whatsapp,
      email: order.email,
      cep: order.cep,
      city: order.city,
      address: order.address,
      items: order.items,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      material: order.material || "",
    });
    setIsEditing(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase">Pedidos</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-6 py-3 rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
        >
          + Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-black uppercase mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="producao">Produção</option>
              <option value="enviado">Enviado</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-black uppercase mb-2">Material</label>
            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
            >
              <option value="">Todos</option>
              {Array.from(new Set(products.map(p => p.material))).map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowTrash(false)}
          className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
            !showTrash ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Pedidos Ativos
        </button>
        <button
          onClick={() => setShowTrash(true)}
          className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
            showTrash ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          Lixeira
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-neutral-600">
              {showTrash ? "Nenhum pedido na lixeira" : "Nenhum pedido encontrado"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {orders.map((order) => (
              <div
                key={order.id}
                onDoubleClick={() => handleEditOrder(order)}
                className="p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black uppercase">{order.code}</p>
                    <p className="text-sm font-medium text-neutral-600">{order.customerName}</p>
                    <p className="text-xs font-bold text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.items.length} itens · {order.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-black uppercase ${
                      order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'producao' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'enviado' ? 'bg-green-100 text-green-800' :
                      order.status === 'entregue' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                    {showTrash ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestoreOrder(order.id); }}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-black uppercase rounded hover:bg-green-700"
                        >
                          Restaurar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePermanentlyDeleteOrder(order.id); }}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditOrder(order); }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase rounded hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded hover:bg-red-700"
                        >
                          Lixeira
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase">
                {isCreating ? "Novo Pedido" : "Editar Pedido"}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedOrder(null);
                  setFormData({
                    customerName: "",
                    whatsapp: "",
                    email: "",
                    cep: "",
                    city: "",
                    address: "",
                    items: [],
                    shippingMethod: "standard",
                    paymentMethod: "pix",
                    material: "",
                  });
                  setValidationErrors({});
                }}
                className="text-2xl font-black hover:text-neutral-600"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-black uppercase mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.customerName ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.customerName && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.whatsapp ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.whatsapp && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.email ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">CEP *</label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.cep ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.cep && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.cep}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Cidade *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.city ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.city && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Material</label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  <option value="">Selecione</option>
                  {Array.from(new Set(products.map(p => p.material))).map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black uppercase mb-2">Endereço Completo *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 text-sm font-medium ${
                    validationErrors.address ? "border-red-500" : "border-neutral-300"
                  }`}
                />
                {validationErrors.address && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Método de Entrega</label>
                <select
                  value={formData.shippingMethod}
                  onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  <option value="standard">Entrega Padrão</option>
                  <option value="express">Entrega Expressa</option>
                  <option value="pickup">Retirada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Método de Pagamento</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  <option value="pix">Pix</option>
                  <option value="card">Cartão</option>
                  <option value="quote">Pedido Assistido</option>
                </select>
              </div>
            </div>

            {/* Items Section */}
            <div className="mt-6">
              <label className="block text-sm font-black uppercase mb-2">Itens do Pedido *</label>
              {validationErrors.items && (
                <p className="text-red-600 text-xs font-bold mb-2">{validationErrors.items}</p>
              )}
              
              <div className="border border-neutral-300 rounded-lg p-4 mb-4">
                <select
                  onChange={(e) => e.target.value && handleAddItem(parseInt(e.target.value))}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                  defaultValue=""
                >
                  <option value="">Adicionar produto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price}
                    </option>
                  ))}
                </select>
              </div>

              {formData.items.length > 0 && (
                <div className="divide-y divide-neutral-200">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-black uppercase text-sm">{item.name}</p>
                        <p className="text-xs font-medium text-neutral-600">
                          R$ {item.price} x {item.quantity} = R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 text-xs font-black uppercase hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isEditing && selectedOrder && (
              <div className="mt-6">
                <label className="block text-sm font-black uppercase mb-2">Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="producao">Produção</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedOrder(null);
                  setFormData({
                    customerName: "",
                    whatsapp: "",
                    email: "",
                    cep: "",
                    city: "",
                    address: "",
                    items: [],
                    shippingMethod: "standard",
                    paymentMethod: "pix",
                    material: "",
                  });
                  setValidationErrors({});
                }}
                className="px-6 py-3 border border-neutral-300 rounded-lg text-sm font-black uppercase hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                onClick={isCreating ? handleCreateOrder : handleUpdateOrder}
                className="px-6 py-3 bg-black text-white rounded-lg text-sm font-black uppercase hover:bg-neutral-800"
              >
                {isCreating ? "Criar Pedido" : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
