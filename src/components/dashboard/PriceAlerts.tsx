"use client";

import { useState } from "react";
import { Bell, BellRing, Check, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AlertDirection, PriceAlert } from "@/lib/types";
import { formatUsd } from "@/lib/format";

interface PriceAlertsProps {
  currentPrice?: number;
  alerts: PriceAlert[];
  onAdd: (target: number, direction: AlertDirection) => void;
  onRemove: (id: string) => void;
  onReset: (id: string) => void;
}

export function PriceAlerts({
  currentPrice,
  alerts,
  onAdd,
  onRemove,
  onReset,
}: PriceAlertsProps) {
  const [target, setTarget] = useState("");
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(target);
    if (!value || value <= 0) {
      setErr("กรุณากรอกราคาเป้าหมายที่ถูกต้อง");
      return;
    }
    setErr("");
    onAdd(value, direction);
    setTarget("");
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-4 w-4 text-gold" />
          การแจ้งเตือนราคา (Gold Spot)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={direction}
              onChange={(e) => setDirection(e.target.value as AlertDirection)}
              className="sm:w-32"
            >
              <option value="above">สูงกว่า ≥</option>
              <option value="below">ต่ำกว่า ≤</option>
            </Select>
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder={currentPrice ? currentPrice.toFixed(2) : "ราคาเป้าหมาย USD"}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="gold">
              ตั้งเตือน
            </Button>
          </div>
          {err && <p className="text-xs text-down">{err}</p>}
        </form>

        <div className="space-y-2">
          {alerts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              ยังไม่มีการแจ้งเตือน — ตั้งราคาเป้าหมายด้านบน
            </p>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {a.triggered ? (
                    <BellRing className="h-4 w-4 text-gold" />
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {a.direction === "above" ? "สูงกว่า" : "ต่ำกว่า"}{" "}
                      <span className="text-gold">{formatUsd(a.target)}</span>
                    </p>
                    {a.triggered && (
                      <Badge variant="gold" className="mt-0.5">
                        <Check className="h-3 w-3" /> แจ้งเตือนแล้ว
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {a.triggered && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="ตั้งใหม่"
                      onClick={() => onReset(a.id)}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-down"
                    aria-label="ลบ"
                    onClick={() => onRemove(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Toast แจ้งเตือนเมื่อราคาแตะเป้า */
export function AlertToast({
  alert,
  price,
  onClose,
}: {
  alert: PriceAlert;
  price: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-card/95 p-4 shadow-2xl shadow-gold/10 backdrop-blur-xl">
        <BellRing className="mt-0.5 h-5 w-5 animate-pulse text-gold" />
        <div className="pr-2">
          <p className="text-sm font-semibold">🔔 แจ้งเตือนราคาทอง</p>
          <p className="text-xs text-muted-foreground">
            Gold Spot แตะ {formatUsd(price)} ({alert.direction === "above" ? "สูงกว่า" : "ต่ำกว่า"}
            เป้าหมาย {formatUsd(alert.target)})
          </p>
        </div>
        <button onClick={onClose} aria-label="ปิด" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
