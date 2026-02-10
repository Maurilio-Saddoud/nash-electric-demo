"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuantityOverride, setQuantityOverride } from "@/lib/session";

type QuantityControlProps = {
  truckId: string;
  itemId: string;
  defaultQuantity: number;
};

export function QuantityControl({ truckId, itemId, defaultQuantity }: QuantityControlProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const override = getQuantityOverride(truckId, itemId);
    if (typeof override === "number") {
      setQuantity(override);
    }
  }, [truckId, itemId]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const decrement = () => setQuantity((prev) => Math.max(0, prev - 1));
  const increment = () => setQuantity((prev) => prev + 1);

  const submitAndClose = () => {
    setQuantityOverride(truckId, itemId, quantity);
    setIsEditing(false);
    router.push(`/truck/${truckId}`);

    if (typeof window !== "undefined" && window.opener) {
      window.close();
    }
  };

  return (
    <section className="w-full rounded-2xl border border-brand.blue/15 bg-brand.white p-4 text-brand.blue shadow-card">
      <div className="grid grid-cols-[84px_1fr_84px] items-stretch gap-3">
        <button
          type="button"
          aria-label="Decrease quantity"
          className="rounded-xl bg-brand.red text-5xl font-bold text-brand.white active:scale-[0.98]"
          onClick={decrement}
        >
          -
        </button>

        {!isEditing ? (
          <button
            type="button"
            className="rounded-xl border-2 border-brand.blue/25 bg-brand.white px-3 py-6 text-center text-6xl font-bold tracking-tight"
            onClick={() => setIsEditing(true)}
          >
            {quantity}
          </button>
        ) : (
          <input
            ref={inputRef}
            value={quantity}
            inputMode="numeric"
            type="number"
            min={0}
            className="rounded-xl border-2 border-brand.blue/30 bg-brand.white px-3 py-6 text-center text-5xl font-bold outline-none"
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              setQuantity(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
            }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitAndClose();
              }
            }}
          />
        )}

        <button
          type="button"
          aria-label="Increase quantity"
          className="rounded-xl bg-brand.blue text-5xl font-bold text-brand.white active:scale-[0.98]"
          onClick={increment}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-brand.blue px-4 py-4 text-xl font-semibold text-brand.white"
        onClick={submitAndClose}
      >
        Save
      </button>
    </section>
  );
}
