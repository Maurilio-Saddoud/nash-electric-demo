import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-brand.blue">Not Found</h1>
      <p className="mt-2 text-brand.blue/70">That truck or inventory item does not exist.</p>
      <Link href="/" className="mt-5 rounded-xl bg-brand.red px-5 py-3 font-semibold text-brand.white">
        Back to Truck Selection
      </Link>
    </main>
  );
}
