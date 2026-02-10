import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <header className="overflow-hidden rounded-3xl border border-brand.blue/15 bg-brand.white shadow-card">
        <div className="h-1.5 w-full bg-brand.red" />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand.blue/70">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-brand.blue">Inventory Management</h1>
          <p className="mt-3 text-sm text-brand.blue/75">
            Phase 5 placeholder. CSV upload and change preview flow will live here.
          </p>
        </div>
      </header>

      <div className="mt-5">
        <Link href="/admin/upload" className="rounded-xl bg-brand.red px-5 py-3 font-semibold text-brand.white">
          Go to Upload Page
        </Link>
      </div>
    </main>
  );
}
