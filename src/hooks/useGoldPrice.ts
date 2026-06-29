"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchQuote } from "@/lib/api";
import type { GoldQuote } from "@/lib/types";

interface UseGoldPriceResult {
  quote: GoldQuote | null;
  prevQuote: GoldQuote | null;
  loading: boolean;
  error: string | null;
  /** ทิศทางการเปลี่ยนแปลงล่าสุดของ spot: 1 ขึ้น, -1 ลง, 0 เท่าเดิม */
  tickDirection: 0 | 1 | -1;
  refresh: () => void;
}

/**
 * ดึงราคาทองแบบ "real-time" ด้วย polling
 * (โครงสร้างพร้อมเปลี่ยนเป็น WebSocket ได้ — ดู README)
 */
export function useGoldPrice(intervalMs = 3000): UseGoldPriceResult {
  const [quote, setQuote] = useState<GoldQuote | null>(null);
  const [prevQuote, setPrevQuote] = useState<GoldQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickDirection, setTickDirection] = useState<0 | 1 | -1>(0);

  const lastSpot = useRef<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const next = await fetchQuote(signal);
      setError(null);
      setQuote((cur) => {
        setPrevQuote(cur);
        return next;
      });
      if (lastSpot.current != null) {
        const diff = next.spotUsd - lastSpot.current;
        setTickDirection(diff > 0 ? 1 : diff < 0 ? -1 : 0);
      }
      lastSpot.current = next.spotUsd;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const id = setInterval(() => load(controller.signal), intervalMs);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load, intervalMs]);

  const refresh = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  return { quote, prevQuote, loading, error, tickDirection, refresh };
}
