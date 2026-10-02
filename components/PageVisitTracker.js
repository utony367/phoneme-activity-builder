"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createVisibleVisit } from "../lib/visible-visit";
export default function PageVisitTracker() {
  const path = usePathname(),
    entry = useRef(null);
  useEffect(() => {
    if (
      !/^\/(?:dashboard|activities(?:\/[1-9]\d*)?|wordle|word-search)?$/.test(
        path,
      )
    ) {
      entry.current = null;
      return;
    }
    if (entry.current?.path !== path)
      entry.current = {
        path,
        visit: createVisibleVisit(path, {
          now: () => performance.now(),
          isVisible: () => document.visibilityState === "visible",
          newKey: () => crypto.randomUUID(),
          send: (data) =>
            navigator.sendBeacon(
              "/api/visits",
              new Blob([JSON.stringify(data)], { type: "application/json" }),
            ),
        }),
      };
    const visit = entry.current.visit;
    visit.resume();
    document.addEventListener("visibilitychange", visit.flush);
    window.addEventListener("pagehide", visit.pause);
    const timer = setInterval(visit.flush, 15000);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visit.flush);
      window.removeEventListener("pagehide", visit.pause);
      visit.pause();
    };
  }, [path]);
  return null;
}
