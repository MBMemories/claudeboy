import "server-only";
import type { GoldQuote } from "./types";

// ===== Free Live Gold Source (ไม่ต้องใช้ API key) =====
// ราคา Gold Spot: https://api.gold-api.com/price/XAU  (real-time, keyless)
// อัตราแลกเปลี่ยน USD/THB: https://open.er-api.com/v6/latest/USD (keyless)
//
// ทำ cache ระดับ server เพื่อไม่ให้ยิงต้นทางถี่เกินไป
// (ฝั่ง client poll ทุก 3 วิ แต่ server จะรีเฟรชราคาจริงทุก ๆ SPOT_TTL)

const TROY_OUNCE_G = 31.1035; // กรัมต่อ troy ounce
const BAHT_GOLD_G = 15.244; // น้ำหนักทอง 1 บาท (กรัม)
const THAI_SPREAD = 50; // ส่วนต่างซื้อ-ขายของทองแท่ง 96.5% (บาท)

const SPOT_TTL = 15_000; // 15 วินาที
const FX_TTL = 60 * 60_000; // 1 ชั่วโมง

let spotCache = { price: 0, ts: 0 };
let fxCache = { thb: 36.5, ts: 0 };
let day = { date: "", open: 0, high: 0, low: 0 };

async function getSpot(): Promise<number> {
  if (spotCache.price > 0 && Date.now() - spotCache.ts < SPOT_TTL) {
    return spotCache.price;
  }
  const res = await fetch("https://api.gold-api.com/price/XAU", { cache: "no-store" });
  if (!res.ok) throw new Error(`gold-api.com error: ${res.status}`);
  const d = await res.json();
  if (!d?.price) throw new Error("gold-api.com: invalid response");
  spotCache = { price: d.price, ts: Date.now() };
  return d.price;
}

async function getUsdThb(): Promise<number> {
  if (fxCache.thb > 0 && Date.now() - fxCache.ts < FX_TTL) {
    return fxCache.thb;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    const d = await res.json();
    const thb = d?.rates?.THB;
    if (thb) fxCache = { thb, ts: Date.now() };
  } catch {
    /* ใช้ค่าเดิมที่ cache ไว้ */
  }
  return fxCache.thb;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ราคา spot จริงปัจจุบัน (ใช้ anchor กราฟ/ประวัติ) */
export async function getLiveSpot(): Promise<number> {
  return getSpot();
}

/** ดึง GoldQuote จากแหล่งจริง (ฟรี ไม่ต้องใช้ key) */
export async function getLiveQuote(): Promise<GoldQuote> {
  const [spot, usdThb] = await Promise.all([getSpot(), getUsdThb()]);

  // ติดตาม open/high/low ของวันใน memory
  // หมายเหตุ: dayOpen คือราคาครั้งแรกที่ server ดึงในวันนั้น
  // (แหล่งฟรีไม่มีราคาเปิดตลาดจริง) จึงเป็นค่าโดยประมาณ
  const key = todayKey();
  if (day.date !== key) {
    day = { date: key, open: spot, high: spot, low: spot };
  }
  day.high = Math.max(day.high, spot);
  day.low = Math.min(day.low, spot);

  const change = spot - day.open;
  const thbPerGram = (spot / TROY_OUNCE_G) * usdThb;
  const thaiBase = Math.round((thbPerGram * BAHT_GOLD_G) / 10) * 10;

  return {
    spotUsd: round2(spot),
    usdThb: round2(usdThb),
    thaiSell: thaiBase + THAI_SPREAD,
    thaiBuy: thaiBase - THAI_SPREAD,
    change: round2(change),
    changePercent: round2((change / day.open) * 100),
    dayHigh: round2(day.high),
    dayLow: round2(day.low),
    dayOpen: round2(day.open),
    timestamp: Date.now(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
