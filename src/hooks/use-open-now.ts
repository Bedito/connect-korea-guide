import { useEffect, useState } from "react";
import { isOpenNow } from "@/lib/queries";

/**
 * Client-only "open now" evaluation. Returns null on the server / first render
 * to avoid SSR/hydration mismatch (the time on the server differs from the
 * client), then the real boolean after mount.
 */
export function useOpenNow(hours: unknown): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    setOpen(isOpenNow(hours));
    // Re-evaluate every minute so the badge stays accurate on long sessions.
    const t = setInterval(() => setOpen(isOpenNow(hours)), 60_000);
    return () => clearInterval(t);
  }, [hours]);
  return open;
}
