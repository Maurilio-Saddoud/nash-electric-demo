import Link from "next/link";
import { notFound } from "next/navigation";
import { SessionGuard } from "@/components/SessionGuard";
import { TruckScanner } from "@/components/TruckScanner";
import { getTruckById, trucks } from "@/lib/mock-data";

type TruckPageProps = {
  params: Promise<{ truckId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return trucks.map((truck) => ({ truckId: truck.id }));
}

export default async function TruckPage({ params }: TruckPageProps) {
  const { truckId } = await params;
  const truck = getTruckById(truckId);

  if (!truck) {
    notFound();
  }

  return (
    <SessionGuard requiredTruckId={truck.id}>
      <main className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden px-4 py-3">
        <header className="overflow-hidden rounded-3xl border border-brand.blue/15 bg-brand.white shadow-card">
          <div className="h-1.5 w-full bg-brand.red" />
          <div className="p-4">
            <h1 className="text-3xl font-bold text-brand.blue">{truck.name}</h1>
          </div>
        </header>

        <div className="mt-3 min-h-0 flex-1">
          <TruckScanner truckId={truck.id} />
        </div>

        <div className="pt-3">
          <Link href="/" className="inline-block text-sm font-semibold uppercase tracking-wide text-brand.blue/70">
            Switch Truck
          </Link>
        </div>
      </main>
    </SessionGuard>
  );
}
