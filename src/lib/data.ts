import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Product } from "./products";

const DATA_DIR = path.join(process.cwd(), "data");

function dataPath(file: string) {
  return path.join(DATA_DIR, file);
}

// In-memory cache used as fallback on read-only filesystems (Vercel)
const memoryStore = new Map<string, string>();

async function ensureDir() {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
  } catch {
    /* read-only filesystem */
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  // Check in-memory first
  const cached = memoryStore.get(file);
  if (cached) {
    try { return JSON.parse(cached) as T; } catch { /* ignore */ }
  }

  await ensureDir();
  const filePath = dataPath(file);
  if (existsSync(filePath)) {
    try {
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch { /* fall through */ }
  }
  return fallback;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  // Always store in memory so reads within the same process work
  memoryStore.set(file, json);
  try {
    await ensureDir();
    await writeFile(dataPath(file), json, "utf-8");
  } catch {
    // Filesystem unavailable (Vercel) — data persisted in memory only
  }
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
  items: { id: number; name: string; price: number; costPrice?: number; image: string; quantity: number }[];
  customer: {
    name: string;
    whatsapp: string;
    email: string;
    cep: string;
    city: string;
    address: string;
    bairro?: string;
    number?: string;
    complement?: string;
  };
  shipping: { method: string; price: number };
  payment: string;
  paymentStatus?: "pendente" | "pago" | "desistencia" | "orcamento" | "reembolsado";
  subtotal: number;
  costTotal?: number;
  discount: number;
  total: number;
  note: string;
  status: "pendente" | "confirmado" | "produção" | "enviado" | "entregue" | "cancelado";
  priority?: "baixa" | "normal" | "alta" | "urgente";
  assignee?: string;
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

export async function updateOrder(id: string, updates: Partial<Pick<Order, "status" | "trackingCode" | "internalNotes" | "customer" | "priority" | "assignee" | "items" | "payment" | "paymentStatus" | "subtotal" | "costTotal" | "discount" | "total" | "shipping" | "note">>): Promise<Order | null> {
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
  if (updates.priority && updates.priority !== current.priority) {
    timeline.push({ date: now, action: `Prioridade alterada para "${updates.priority}"` });
  }
  if (updates.assignee !== undefined && updates.assignee !== current.assignee) {
    timeline.push({ date: now, action: updates.assignee ? `Atribuído a ${updates.assignee}` : "Responsável removido" });
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

// --- Users ---

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "manager" | "viewer";
  createdAt: string;
};

const defaultUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Administrador",
    email: "admin@kromalab.com.br",
    password: "kromalab2026",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

export async function getUsers(): Promise<AdminUser[]> {
  return readJson<AdminUser[]>("users.json", defaultUsers);
}

export async function getUserById(id: string): Promise<AdminUser | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(user: Omit<AdminUser, "id" | "createdAt">): Promise<AdminUser> {
  const users = await getUsers();
  const newUser: AdminUser = {
    ...user,
    id: `user-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeJson("users.json", users);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<Pick<AdminUser, "name" | "email" | "role" | "password">>): Promise<AdminUser | null> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await writeJson("users.json", users);
  return users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  if (users.length <= 1) return false;
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  await writeJson("users.json", filtered);
  return true;
}

// --- Inventory / Materials ---

export type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  costPerUnit: number;
  updatedAt: string;
  createdAt: string;
};

const materialCategories = ["Tintas", "Rolos", "Pó DTF", "Filmes", "Tecidos", "Embalagens", "Outros"];

const defaultMaterials: Material[] = [];

export async function getMaterials(): Promise<Material[]> {
  return readJson<Material[]>("materials.json", defaultMaterials);
}

export async function getMaterialById(id: string): Promise<Material | undefined> {
  const materials = await getMaterials();
  return materials.find((m) => m.id === id);
}

export async function createMaterial(material: Omit<Material, "id" | "createdAt" | "updatedAt">): Promise<Material> {
  const materials = await getMaterials();
  const newMaterial: Material = {
    ...material,
    id: `mat-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  materials.push(newMaterial);
  await writeJson("materials.json", materials);
  return newMaterial;
}

export async function updateMaterial(id: string, updates: Partial<Omit<Material, "id" | "createdAt">>): Promise<Material | null> {
  const materials = await getMaterials();
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return null;
  materials[index] = { ...materials[index], ...updates, updatedAt: new Date().toISOString() };
  await writeJson("materials.json", materials);
  return materials[index];
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const materials = await getMaterials();
  const filtered = materials.filter((m) => m.id !== id);
  if (filtered.length === materials.length) return false;
  await writeJson("materials.json", filtered);
  return true;
}

export async function deductMaterials(items: { materialId: string; quantity: number }[]): Promise<{ success: boolean; errors: string[] }> {
  const materials = await getMaterials();
  const errors: string[] = [];

  for (const item of items) {
    const mat = materials.find((m) => m.id === item.materialId);
    if (!mat) {
      errors.push(`Material ${item.materialId} não encontrado`);
      continue;
    }
    if (mat.quantity < item.quantity) {
      errors.push(`${mat.name}: estoque insuficiente (disponível: ${mat.quantity} ${mat.unit}, solicitado: ${item.quantity})`);
      continue;
    }
    mat.quantity -= item.quantity;
    mat.updatedAt = new Date().toISOString();
  }

  if (errors.length === 0) {
    await writeJson("materials.json", materials);
  }

  return { success: errors.length === 0, errors };
}
