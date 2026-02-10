"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSelectedTruckId } from "@/lib/session";

type SessionGuardProps = {
  requiredTruckId: string;
  children: React.ReactNode;
};

export function SessionGuard({ requiredTruckId, children }: SessionGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const selectedTruckId = getSelectedTruckId();
    if (!selectedTruckId || selectedTruckId !== requiredTruckId) {
      setAllowed(false);
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [requiredTruckId, router]);

  if (allowed === null) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-8">
        <p className="text-base text-brand.blue/70">Checking session...</p>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
