"use client";

import { useEffect } from "react";
import { clearSelectedTruckId } from "@/lib/session";

export function SessionWatcher() {
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearSelectedTruckId();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return null;
}

