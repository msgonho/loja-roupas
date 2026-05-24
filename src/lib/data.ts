import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Product } from "./products";

const DATA_DIR = path.join(process.cwd(), "data");

function dataPath(file: string) {
  return path.join(DATA_DIR, file);
}

async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  const filePath = dataPath(file);
  if (!existsSync(filePath)) {
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  await writeFile(dataPath(file), JSON.stringify(data, null, 2), "utf-8");
}

// --- Products ---

export async function getProducts(): Promise<Product[]> {
  const { products: defaultProducts } = await import("./products");
  return readJson<Product[]>("products.json", defaultProducts);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const products = await getProducts();
  const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
  const newProduct: Product = { ...product, id: maxId + 1 };
  products.push(newProduct);
  await writeJson("products.json", products);
  return newProduct;
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates, id };
  await writeJson("products.json", products);
  return products[index];
}

export async function deleteProduct(id: number): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  await writeJson("products.json", filtered);
  return true;
}

// --- Orders ---

export type OrderEvent = {
  date: string;
  action: string;
};

export type Order = {
  id: string;
  items: { id: number; name: string; price: number; image: string; quantity: number }[];
  customer: {
    name: string;
    whatsapp: string;
    email: string;
    cep: string;
    city: string;
    address: string;
  };
  shipping: { method: string; price: number };
  payment: string;
  subtotal: number;
  discount: number;
  total: number;
  note: string;
  status: "pendente" | "confirmado" | "produção" | "enviado" | "entregue" | "cancelado";
  trackingCode?: string;
  internalNotes?: string;
  timeline?: OrderEvent[];
  createdAt: string;
  updatedAt?: string;
};

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>("orders.json", []);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
}

export async function createOrder(order: Omit<Order, "id" | "status" | "createdAt" | "timeline">): Promise<Order> {
  const orders = await getOrders();
  const newOrder: Order = {
    ...order,
    id: `KR-${Date.now().toString().slice(-6)}`,
    status: "pendente",
    timeline: [{ date: new Date().toISOString(), action: "Pedido criado" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  await writeJson("orders.json", orders);
  return newOrder;
}

export async function updateOrder(id: string, updates: Partial<Pick<Order, "status" | "trackingCode" | "internalNotes" | "customer">>): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = orders[index];
  const timeline = current.timeline || [];
  const now = new Date().toISOString();

  if (updates.status && updates.status !== current.status) {
    timeline.push({ date: now, action: `Status alterado para "${updates.status}"` });
  }
  if (updates.trackingCode && updates.trackingCode !== current.trackingCode) {
    timeline.push({ date: now, action: `Código de rastreio: ${updates.trackingCode}` });
  }
  if (updates.internalNotes && updates.internalNotes !== current.internalNotes) {
    timeline.push({ date: now, action: "Nota interna atualizada" });
  }

  orders[index] = { ...current, ...updates, timeline, updatedAt: now };
  await writeJson("orders.json", orders);
  return orders[index];
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await getOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  await writeJson("orders.json", filtered);
  return true;
}

// --- Settings ---

export type SiteSettings = {
  whatsappNumber: string;
  siteName: string;
  siteDescription: string;
  freeShippingThreshold: number;
  pixDiscount: number;
  activeCoupons: { code: string; discount: number }[];
};

const defaultSettings: SiteSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999",
  siteName: "KromaLab Personalizados",
  siteDescription: "Streetwear, camisetas personalizadas, brindes e pedidos em atacado.",
  freeShippingThreshold: 299,
  pixDiscount: 0.05,
  activeCoupons: [{ code: "KROMA10", discount: 0.1 }],
};

export async function getSettings(): Promise<SiteSettings> {
  return readJson<SiteSettings>("settings.json", defaultSettings);
}

export async function updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const settings = await getSettings();
  const updated = { ...settings, ...updates };
  await writeJson("settings.json", updated);
  return updated;
}
