"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AlertDirection, GoldQuote, PriceAlert } from "@/lib/types";

const STORAGE_KEY = "gold-price-alerts";

/** จัดการการแจ้งเตือนราคา + persist ลง localStorage + เช็คเงื่อนไขทุกครั้งที่ราคาเปลี่ยน */
export function usePriceAlerts(quote: GoldQuote | null) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [justTriggered, setJustTriggered] = useState<PriceAlert | null>(null);
  const loaded = useRef(false);

  // โหลดจาก localStorage ครั้งแรก
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAlerts(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, []);

  // บันทึกทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      /* ignore */
    }
  }, [alerts]);

  // ขอสิทธิ์ notification ของเบราว์เซอร์
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const addAlert = useCallback((target: number, direction: AlertDirection) => {
    setAlerts((prev) => [
      {
        id: crypto.randomUUID(),
        target,
        direction,
        createdAt: Date.now(),
        triggered: false,
      },
      ...prev,
    ]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const resetAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, triggered: false, triggeredAt: undefined } : a,
      ),
    );
  }, []);

  // ตรวจสอบเงื่อนไขเมื่อราคาเปลี่ยน
  useEffect(() => {
    if (!quote) return;
    const price = quote.spotUsd;

    setAlerts((prev) => {
      let firedAlert: PriceAlert | null = null;
      const next = prev.map((a) => {
        if (a.triggered) return a;
        const hit =
          (a.direction === "above" && price >= a.target) ||
          (a.direction === "below" && price <= a.target);
        if (hit) {
          const fired = { ...a, triggered: true, triggeredAt: Date.now() };
          firedAlert = fired;
          return fired;
        }
        return a;
      });

      if (firedAlert) {
        const fa = firedAlert as PriceAlert;
        setJustTriggered(fa);
        notify(fa, price);
      }
      return next;
    });
  }, [quote]);

  const dismissToast = useCallback(() => setJustTriggered(null), []);

  return { alerts, addAlert, removeAlert, resetAlert, justTriggered, dismissToast };
}

function notify(alert: PriceAlert, price: number) {
  const dir = alert.direction === "above" ? "สูงกว่า" : "ต่ำกว่า";
  const body = `Gold Spot แตะ $${price.toFixed(2)} (${dir}เป้าหมาย $${alert.target.toFixed(2)})`;
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification("🔔 แจ้งเตือนราคาทอง", { body });
    } catch {
      /* ignore */
    }
  }
}
