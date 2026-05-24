export type Order = {
  id: string;
  code: string;
  customerName: string;
  whatsapp: string;
  email: string;
  cep: string;
  city: string;
  address: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pendente" | "confirmado" | "producao" | "enviado" | "entregue" | "cancelado";
  material?: string;
  createdAt: string;
  deletedAt?: string;
};

const STORAGE_KEY = "kromalab-orders";

export function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "KR-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  
  const savedOrders = localStorage.getItem(STORAGE_KEY);
  if (!savedOrders) return [];
  
  try {
    return JSON.parse(savedOrders);
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(order: Omit<Order, "id" | "code" | "createdAt">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: Date.now().toString(),
    code: generateOrderCode(),
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...updates };
  saveOrders(orders);
  return orders[index];
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return false;
  
  orders[index].deletedAt = new Date().toISOString();
  saveOrders(orders);
  return true;
}

export function restoreOrder(id: string): boolean {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return false;
  
  delete orders[index].deletedAt;
  saveOrders(orders);
  return true;
}

export function permanentlyDeleteOrder(id: string): boolean {
  let orders = getOrders();
  const initialLength = orders.length;
  orders = orders.filter((o) => o.id !== id);
  
  if (orders.length === initialLength) return false;
  
  saveOrders(orders);
  return true;
}
