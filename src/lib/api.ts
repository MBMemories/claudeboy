import type { GoldQuote, HistoryResponse, TimeRange } from "./types";

// ===== Client-side data access layer =====

export async function fetchQuote(signal?: AbortSignal): Promise<GoldQuote> {
  const res = await fetch("/api/gold", { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load quote (${res.status})`);
  return res.json();
}

export async function fetchHistory(
  range: TimeRange,
  signal?: AbortSignal,
): Promise<HistoryResponse> {
  const res = await fetch(`/api/gold/history?range=${range}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
  return res.json();
}
