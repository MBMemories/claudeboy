"use client";

import type { TimeRange } from "@/lib/types";
import { cn } from "@/lib/utils";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "1H", label: "1 ชั่วโมง" },
  { value: "1D", label: "1 วัน" },
  { value: "1W", label: "1 สัปดาห์" },
  { value: "1M", label: "1 เดือน" },
  { value: "1Y", label: "1 ปี" },
];

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
            value === r.value
              ? "bg-gradient-to-r from-gold-dark to-gold text-black shadow"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
