"use client";

import { Coins, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { PriceCard } from "./PriceCard";
import type { GoldQuote } from "@/lib/types";
import {
  formatPercent,
  formatSignedUsd,
  formatThb,
  formatUsd,
} from "@/lib/format";

interface PriceCardGridProps {
  quote: GoldQuote | null;
  loading: boolean;
  tick: 0 | 1 | -1;
}

export function PriceCardGrid({ quote, loading, tick }: PriceCardGridProps) {
  const showSkeleton = loading && !quote;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PriceCard
        loading={showSkeleton}
        label="Gold Spot (XAU/USD)"
        icon={Coins}
        accent="gold"
        value={quote ? formatUsd(quote.spotUsd) : "—"}
        sub="ต่อ troy ounce"
        change={quote?.change}
        changeText={
          quote ? `${formatSignedUsd(quote.change)} (${formatPercent(quote.changePercent)})` : ""
        }
        tick={tick}
      />

      <PriceCard
        loading={showSkeleton}
        label="ทองไทย 96.5% — ขายออก"
        icon={TrendingUp}
        accent="gold"
        value={quote ? formatThb(quote.thaiSell) : "—"}
        sub="ลูกค้าซื้อ / บาททอง"
      />

      <PriceCard
        loading={showSkeleton}
        label="ทองไทย 96.5% — รับซื้อ"
        icon={TrendingDown}
        accent="gold"
        value={quote ? formatThb(quote.thaiBuy) : "—"}
        sub="ร้านรับซื้อ / บาททอง"
      />

      <PriceCard
        loading={showSkeleton}
        label="ช่วงราคาวันนี้ (Spot)"
        icon={Activity}
        value={quote ? formatUsd(quote.dayHigh) : "—"}
        sub={quote ? `ต่ำสุด ${formatUsd(quote.dayLow)}` : "—"}
        changeText={quote ? `เปิด ${formatUsd(quote.dayOpen)}` : ""}
      />
    </div>
  );
}
