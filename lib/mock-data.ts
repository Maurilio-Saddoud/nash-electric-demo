import type { InventoryItem, Truck } from "@/lib/types";

export const trucks: Truck[] = [
  { id: "truck-1", name: "Truck 1" },
  { id: "truck-2", name: "Truck 2" }
];

export const inventoryItems: InventoryItem[] = [
  {
    id: "wire-12awg-spool",
    truckId: "truck-1",
    partName: "12 AWG Wire Spool",
    partNumber: "W-12-500",
    quantity: 4,
    binLocation: "Bin A3",
    rowLocation: "Left Wall"
  },
  {
    id: "breaker-20a",
    truckId: "truck-1",
    partName: "20A Breaker",
    partNumber: "BR-20A",
    quantity: 18,
    binLocation: "Bin B1",
    rowLocation: "Top Shelf"
  },
  {
    id: "outlet-gfci",
    truckId: "truck-1",
    partName: "GFCI Outlet",
    partNumber: "GF-15",
    quantity: 10,
    binLocation: "Bin C2",
    rowLocation: "Right Wall"
  },
  {
    id: "conduit-34",
    truckId: "truck-2",
    partName: "3/4 Conduit Coupling",
    partNumber: "CD-34",
    quantity: 26,
    binLocation: "Bin D4",
    rowLocation: "Rear Rack"
  },
  {
    id: "wire-nut-red",
    truckId: "truck-2",
    partName: "Red Wire Nuts",
    partNumber: "WN-R",
    quantity: 60,
    binLocation: "Bin A1",
    rowLocation: "Door Side"
  },
  {
    id: "switch-single-pole",
    truckId: "truck-2",
    partName: "Single Pole Switch",
    partNumber: "SW-1P",
    quantity: 14,
    binLocation: "Bin B3",
    rowLocation: "Top Shelf"
  }
];

export function getTruckById(truckId: string) {
  return trucks.find((truck) => truck.id === truckId);
}

export function getItemsByTruckId(truckId: string) {
  return inventoryItems.filter((item) => item.truckId === truckId);
}

export function getItemByTruckAndId(truckId: string, itemId: string) {
  return inventoryItems.find((item) => item.truckId === truckId && item.id === itemId);
}

export function createInventoryUrl(baseUrl: string, truckId: string, itemId: string) {
  return `${baseUrl.replace(/\/$/, "")}/truck/${truckId}/item/${itemId}`;
}

