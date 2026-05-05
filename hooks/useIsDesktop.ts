"use client";

import { useState, useEffect } from "react";

/** Returns true once the viewport is ≥ 768px (Tailwind's `md` breakpoint). */
export function useIsDesktop(): boolean {
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMd;
}
