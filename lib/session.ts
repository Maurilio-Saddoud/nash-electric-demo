export const SELECTED_TRUCK_SESSION_KEY = "nash.selectedTruckId";
const ITEM_OVERRIDES_KEY = "nash.itemQuantityOverrides";

export function setSelectedTruckId(truckId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SELECTED_TRUCK_SESSION_KEY, truckId);
}

export function getSelectedTruckId() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SELECTED_TRUCK_SESSION_KEY);
}

export function clearSelectedTruckId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SELECTED_TRUCK_SESSION_KEY);
}

type QuantityOverrides = Record<string, number>;

function getOverrides(): QuantityOverrides {
  if (typeof window === "undefined") return {};

  const raw = window.sessionStorage.getItem(ITEM_OVERRIDES_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as QuantityOverrides;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function setOverrides(overrides: QuantityOverrides) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ITEM_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function getQuantityOverride(truckId: string, itemId: string) {
  const key = `${truckId}:${itemId}`;
  return getOverrides()[key];
}

export function setQuantityOverride(truckId: string, itemId: string, quantity: number) {
  const key = `${truckId}:${itemId}`;
  const next = getOverrides();
  next[key] = quantity;
  setOverrides(next);
}

