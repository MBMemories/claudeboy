"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Header } from "./Header";
import { PriceCardGrid } from "./PriceCardGrid";
import { GoldChart } from "./GoldChart";
import { HistoryTable } from "./HistoryTable";
import { PriceAlerts, AlertToast } from "./PriceAlerts";
import { Button } from "@/components/ui/button";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import type { TimeRange } from "@/lib/types";

export function Dashboard() {
  const { quote, loading, error, tickDirection, refresh } = useGoldPrice(3000);
  const [range, setRange] = useState<TimeRange>("1D");
  const {
    alerts,
    addAlert,
    removeAlert,
    resetAlert,
    justTriggered,
    dismissToast,
  } = usePriceAlerts(quote);

  const connected = !error;

  return (
    <div className="app-bg min-h-screen">
      <Header
        lastUpdated={quote?.timestamp}
        connected={connected}
        onRefresh={refresh}
      />

      <main className="container space-y-4 py-6">
        {/* Error State ระดับหน้า */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-down/40 bg-down/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-down">
              <AlertCircle className="h-4 w-4" />
              เชื่อมต่อข้อมูลราคาไม่สำเร็จ: {error}
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              ลองใหม่
            </Button>
          </div>
        )}

        {/* Dashboard Cards */}
        <PriceCardGrid quote={quote} loading={loading} tick={tickDirection} />

        {/* กราฟ + แจ้งเตือน */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GoldChart
              range={range}
              onRangeChange={setRange}
              livePrice={quote?.spotUsd}
              alerts={alerts}
            />
          </div>
          <div>
            <PriceAlerts
              currentPrice={quote?.spotUsd}
              alerts={alerts}
              onAdd={addAlert}
              onRemove={removeAlert}
              onReset={resetAlert}
            />
          </div>
        </div>

        {/* ตารางประวัติ */}
        <HistoryTable range={range} />

        <footer className="py-4 text-center text-xs text-muted-foreground">
          ข้อมูลเพื่อการสาธิต · โหมด Mock โดยค่าเริ่มต้น · ตั้งค่า API จริงได้ใน .env
        </footer>
      </main>

      {/* Toast แจ้งเตือน */}
      {justTriggered && quote && (
        <AlertToast alert={justTriggered} price={quote.spotUsd} onClose={dismissToast} />
      )}
    </div>
  );
}
