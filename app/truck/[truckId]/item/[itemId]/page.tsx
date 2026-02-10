import Link from "next/link";
import { notFound } from "next/navigation";
import { QuantityControl } from "@/components/QuantityControl";
import { SessionGuard } from "@/components/SessionGuard";
import { getItemByTruckAndId, getTruckById, inventoryItems } from "@/lib/mock-data";

type ItemPageProps = {
  params: Promise<{ truckId: string; itemId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return inventoryItems.map((item) => ({
    truckId: item.truckId,
    itemId: item.id
  }));
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { truckId, itemId } = await params;
  const truck = getTruckById(truckId);

  if (!truck) {
    notFound();
  }

  const item = getItemByTruckAndId(truck.id, itemId);
  if (!item) {
    notFound();
  }

  return (
    <SessionGuard requiredTruckId={truck.id}>
      <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8">
        <div className="overflow-hidden rounded-3xl border border-brand.blue/15 bg-brand.white shadow-card">
          <div className="h-1.5 w-full bg-brand.red" />
          <div className="p-4">
            <h1 className="mt-2 text-3xl font-bold leading-tight text-brand.blue">{item.partName}</h1>
            <p className="mt-1 text-sm text-brand.blue/75">
              {item.partNumber ? `Part #${item.partNumber}` : "No part number"}
              {item.binLocation ? ` - ${item.binLocation}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <QuantityControl truckId={truck.id} itemId={item.id} defaultQuantity={item.quantity} />
        </div>

        <Link
          href={`/truck/${truck.id}`}
          className="mt-4 inline-block text-sm font-semibold uppercase tracking-wide text-brand.blue/75"
        >
          Back to {truck.name}
        </Link>
      </main>
    </SessionGuard>
  );
}
