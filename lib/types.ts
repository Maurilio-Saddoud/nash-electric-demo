export type Truck = {
  id: string;
  name: string;
};

export type InventoryItem = {
  id: string;
  truckId: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  binLocation?: string;
  rowLocation?: string;
};

