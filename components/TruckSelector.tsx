"use client";

import { useRouter } from "next/navigation";
import type { Truck } from "@/lib/types";
import { setSelectedTruckId } from "@/lib/session";

type TruckSelectorProps = {
  trucks: Truck[];
};

export function TruckSelector({ trucks }: TruckSelectorProps) {
  const router = useRouter();

  const handleSelect = (truckId: string) => {
    setSelectedTruckId(truckId);
    router.push(`/truck/${truckId}`);
  };

  return (
    <div className="grid gap-4">
      {trucks.map((truck) => (
        <button
          key={truck.id}
          type="button"
          className="group relative overflow-hidden rounded-2xl border border-brand.blue/15 bg-brand.white px-6 py-5 text-left shadow-card transition active:scale-[0.995]"
          onClick={() => handleSelect(truck.id)}
        >
          <span
            className={`absolute inset-y-0 left-0 w-1.5 ${truck.id.endsWith("1") ? "bg-brand.red" : "bg-brand.blue"}`}
          />
          <p className="pl-2 text-2xl font-semibold text-brand.blue">{truck.name}</p>
        </button>
      ))}
    </div>
  );
}
