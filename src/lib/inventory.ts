export type InventoryItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  entryDate: string;
  batchNumber?: string;
  notes?: string;
};

const STORAGE_KEY = "kromalab-inventory";

export function getInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  
  const savedInventory = localStorage.getItem(STORAGE_KEY);
  if (!savedInventory) return [];
  
  try {
    return JSON.parse(savedInventory);
  } catch {
    return [];
  }
}

export function saveInventory(items: InventoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addInventoryItem(item: Omit<InventoryItem, "id">): InventoryItem {
  const inventory = getInventory();
  const newItem: InventoryItem = {
    ...item,
    id: Date.now(),
  };
  inventory.push(newItem);
  saveInventory(inventory);
  return newItem;
}

export function updateInventoryItem(id: number, updates: Partial<InventoryItem>): InventoryItem | null {
  const inventory = getInventory();
  const index = inventory.findIndex((item) => item.id === id);
  
  if (index === -1) return null;
  
  inventory[index] = { ...inventory[index], ...updates };
  saveInventory(inventory);
  return inventory[index];
}

export function deleteInventoryItem(id: number): boolean {
  const inventory = getInventory();
  const initialLength = inventory.length;
  const filtered = inventory.filter((item) => item.id !== id);
  
  if (filtered.length === initialLength) return false;
  
  saveInventory(filtered);
  return true;
}

export function getInventoryByProduct(productId: number): InventoryItem[] {
  const inventory = getInventory();
  return inventory.filter((item) => item.productId === productId);
}

export function getTotalStockByProduct(productId: number): number {
  const items = getInventoryByProduct(productId);
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getOldestItems(limit: number = 10): InventoryItem[] {
  const inventory = getInventory();
  return inventory
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .slice(0, limit);
}

export function getLowStockItems(threshold: number = 5): Array<{ productId: number; productName: string; totalStock: number }> {
  const inventory = getInventory();
  const stockByProduct: Record<number, { productName: string; totalStock: number }> = {};
  
  inventory.forEach((item) => {
    if (!stockByProduct[item.productId]) {
      stockByProduct[item.productId] = {
        productName: item.productName,
        totalStock: 0,
      };
    }
    stockByProduct[item.productId].totalStock += item.quantity;
  });
  
  return Object.entries(stockByProduct)
    .filter(([_, data]) => data.totalStock <= threshold)
    .map(([productId, data]) => ({
      productId: parseInt(productId),
      productName: data.productName,
      totalStock: data.totalStock,
    }));
}
