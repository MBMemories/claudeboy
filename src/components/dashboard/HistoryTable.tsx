"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoldHistory } from "@/hooks/useGoldHistory";
import type { TimeRange } from "@/lib/types";
import { formatDate, formatTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HistoryTableProps {
  range: TimeRange;
}

export function HistoryTable({ range }: HistoryTableProps) {
  const { data, loading, error } = useGoldHistory(range);
  const candles = data ? [...data.candles].reverse() : [];

  const showDate = range === "1M" || range === "1Y" || range === "1W";

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground">ประวัติราคา (OHLC)</CardTitle>
        <p className="text-xs text-muted-foreground">ราคาเปิด / สูงสุด / ต่ำสุด / ปิด</p>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-down">โหลดข้อมูลไม่สำเร็จ: {error}</p>
        ) : (
          <div className="max-h-[340px] overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">{showDate ? "วันที่" : "เวลา"}</th>
                  <th className="px-3 py-2 text-right font-medium">เปิด</th>
                  <th className="px-3 py-2 text-right font-medium">สูงสุด</th>
                  <th className="px-3 py-2 text-right font-medium">ต่ำสุด</th>
                  <th className="px-3 py-2 text-right font-medium">ปิด</th>
                </tr>
              </thead>
              <tbody>
                {candles.map((c, i) => {
                  const up = c.close >= c.open;
                  return (
                    <tr
                      key={c.time}
                      className={cn(
                        "border-t border-border/50 transition-colors hover:bg-accent/40",
                        i % 2 === 1 && "bg-muted/10",
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {showDate ? formatDate(c.time) : formatTime(c.time)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatUsd(c.open)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-up">{formatUsd(c.high)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-down">{formatUsd(c.low)}</td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-medium tabular-nums",
                          up ? "text-up" : "text-down",
                        )}
                      >
                        {formatUsd(c.close)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
