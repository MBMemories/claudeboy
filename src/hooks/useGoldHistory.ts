"use client";

import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/api";
import type { HistoryResponse, TimeRange } from "@/lib/types";

interface UseGoldHistoryResult {
  data: HistoryResponse | null;
  loading: boolean;
  error: string | null;
}

/** โหลดประวัติราคาตามช่วงเวลา และรีเฟรชเป็นระยะให้กราฟ "เคลื่อนไหว" */
export function useGoldHistory(range: TimeRange, refreshMs = 15000): UseGoldHistoryResult {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const res = await fetchHistory(range, controller.signal);
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      active = false;
      controller.abort();
      clearInterval(id);
    };
  }, [range, refreshMs]);

  return { data, loading, error };
}
