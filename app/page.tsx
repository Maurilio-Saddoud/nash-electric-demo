import { TruckSelector } from "@/components/TruckSelector";
import { trucks } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8">
      <div className="overflow-hidden rounded-3xl border border-brand.blue/15 bg-brand.white shadow-card">
        <div className="h-1.5 w-full bg-brand.red" />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand.blue/70">Nash Electric</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-brand.blue">Van Inventory</h1>
        </div>
      </div>

      <section className="mt-6">
        <TruckSelector trucks={trucks} />
      </section>
    </main>
  );
}
