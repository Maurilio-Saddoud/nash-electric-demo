import type { InventoryItem, Truck } from "@/lib/types";
import { inventoryItems, trucks } from "@/lib/mock-data";

const itemMap = new Map<string, InventoryItem>(
  inventoryItems.map((item) => [`${item.truckId}:${item.id}`, { ...item }])
);

export function listTrucks(): Truck[] {
  return trucks.map((truck) => ({ ...truck }));
}

export function listItems(truckId?: string): InventoryItem[] {
  const values = Array.from(itemMap.values());
  const filtered = truckId ? values.filter((item) => item.truckId === truckId) : values;
  return filtered.map((item) => ({ ...item }));
}

export function getItem(truckId: string, itemId: string) {
  const record = itemMap.get(`${truckId}:${itemId}`);
  return record ? { ...record } : null;
}

export function updateItemQuantity(truckId: string, itemId: string, quantity: number) {
  const key = `${truckId}:${itemId}`;
  const current = itemMap.get(key);
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    quantity: Math.max(0, quantity)
  };

  itemMap.set(key, next);
  return { ...next };
}

