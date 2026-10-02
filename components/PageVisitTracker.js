"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function PageVisitTracker() {
  const path = usePathname();
  useEffect(() => {
    if (
      !/^\/(?:dashboard|activities(?:\/[1-9]\d*)?|wordle|word-search)?$/.test(
        path,
      )
    )
      return;
    const visitKey = crypto.randomUUID();
    let elapsed = 0;
    let since =
      document.visibilityState === "visible" ? performance.now() : null;
    const flush = () => {
      if (since !== null) elapsed += performance.now() - since;
      since = document.visibilityState === "visible" ? performance.now() : null;
      if (elapsed < 1) return;
      const body = JSON.stringify({
        visitKey,
        path,
        visibleDurationMs: Math.min(1800000, Math.round(elapsed)),
      });
      navigator.sendBeacon(
        "/api/visits",
        new Blob([body], { type: "application/json" }),
      );
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    const timer = setInterval(flush, 15000);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [path]);
  return null;
}
