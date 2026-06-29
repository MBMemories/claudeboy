"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { useGoldHistory } from "@/hooks/useGoldHistory";
import type { PriceAlert, TimeRange } from "@/lib/types";
import { formatAxisTime, formatTime, formatUsd } from "@/lib/format";
import { AlertTriangle, ZoomOut } from "lucide-react";

interface GoldChartProps {
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  livePrice?: number;
  alerts: PriceAlert[];
}

export function GoldChart({ range, onRangeChange, livePrice, alerts }: GoldChartProps) {
  const { data, loading, error } = useGoldHistory(range);
  // index ของ Brush สำหรับ zoom/pan — reset เมื่อเปลี่ยนช่วงเวลา
  const [brush, setBrush] = useState<{ start?: number; end?: number }>({});

  const chartData = useMemo(
    () => data?.points.map((p) => ({ ...p, label: formatAxisTime(p.time, range) })) ?? [],
    [data, range],
  );

  const { min, max } = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0 };
    const prices = chartData.map((d) => d.price);
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    const pad = (hi - lo) * 0.1 || 5;
    return { min: lo - pad, max: hi + pad };
  }, [chartData]);

  const activeAlerts = alerts.filter((a) => !a.triggered);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-foreground">กราฟราคา Gold Spot (XAU/USD)</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ลากแถบด้านล่างเพื่อ Zoom &amp; Pan · อัปเดตอัตโนมัติ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(brush.start !== undefined || brush.end !== undefined) && (
            <Button variant="outline" size="sm" onClick={() => setBrush({})}>
              <ZoomOut className="h-3.5 w-3.5" /> รีเซ็ตซูม
            </Button>
          )}
          <TimeRangeSelector value={range} onChange={onRangeChange} />
        </div>
      </CardHeader>

      <CardContent>
        {loading && !data ? (
          <Skeleton className="h-[340px] w-full" />
        ) : error ? (
          <div className="flex h-[340px] flex-col items-center justify-center gap-2 text-center">
            <AlertTriangle className="h-8 w-8 text-down" />
            <p className="text-sm font-medium text-down">โหลดกราฟไม่สำเร็จ</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43 74% 55%)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(43 74% 55%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  minTickGap={32}
                />
                <YAxis
                  domain={[min, max]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v) => `$${Math.round(v)}`}
                />
                <Tooltip content={<ChartTooltip />} />

                {/* เส้นราคา live ปัจจุบัน */}
                {livePrice && (
                  <ReferenceLine
                    y={livePrice}
                    stroke="hsl(43 74% 55%)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                )}

                {/* เส้นเป้าหมายการแจ้งเตือนที่ยังไม่ทำงาน */}
                {activeAlerts.map((a) => (
                  <ReferenceLine
                    key={a.id}
                    y={a.target}
                    stroke={a.direction === "above" ? "hsl(var(--up))" : "hsl(var(--down))"}
                    strokeDasharray="2 6"
                    strokeWidth={1}
                  />
                ))}

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(43 74% 55%)"
                  strokeWidth={2}
                  fill="url(#goldFill)"
                  isAnimationActive={false}
                  dot={false}
                />

                <Brush
                  dataKey="label"
                  height={28}
                  travellerWidth={8}
                  stroke="hsl(43 74% 50%)"
                  fill="hsl(var(--muted) / 0.3)"
                  startIndex={brush.start}
                  endIndex={brush.end}
                  onChange={(r: { startIndex?: number; endIndex?: number }) =>
                    setBrush({ start: r.startIndex, end: r.endIndex })
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-xs text-muted-foreground">{formatTime(p.time)}</p>
      <p className="text-sm font-bold text-gold">{formatUsd(p.price)}</p>
    </div>
  );
}
