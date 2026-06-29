import type { Candle, GoldQuote, HistoryResponse, PricePoint, TimeRange } from "./types";

// ===== Mock Gold Price Engine =====
// จำลองราคาทองแบบ random-walk รอบราคาฐาน เพื่อให้รันทดสอบได้ทันที
// โดยไม่ต้องมี API key จริง

const BASE_SPOT = 2350; // ราคา Gold Spot ฐาน (USD/oz)
const USD_THB = 36.5; // อัตราแลกเปลี่ยนจำลอง
const TROY_OUNCE_G = 31.1035; // กรัมต่อ troy ounce
const BAHT_GOLD_G = 15.244; // น้ำหนักทอง 1 บาท (กรัม)
const THAI_SPREAD = 50; // ส่วนต่างซื้อ-ขาย (บาท) ของทองแท่ง 96.5%

/** สถานะของ spot ปัจจุบัน (เก็บในหน่วยความจำของ server process) */
let currentSpot = BASE_SPOT;
let dayOpen = BASE_SPOT;
let dayHigh = BASE_SPOT;
let dayLow = BASE_SPOT;
let dayStart = startOfDay(Date.now());

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** random-walk แบบ mean-reverting เพื่อไม่ให้ราคาหลุดกรอบ */
function nextStep(price: number, volatility: number, base = BASE_SPOT): number {
  const drift = (base - price) * 0.02; // ดึงกลับเข้าหาค่าฐานเล็กน้อย
  const shock = (Math.random() - 0.5) * 2 * volatility;
  return Math.max(price + drift + shock, 1);
}

/** แปลง spot (USD/oz) -> ราคาทองไทย 96.5% ต่อบาททอง (THB) */
function spotToThaiBaht(spotUsd: number): number {
  const thbPerGram = (spotUsd / TROY_OUNCE_G) * USD_THB;
  const perBaht = thbPerGram * BAHT_GOLD_G;
  return Math.round(perBaht / 10) * 10; // ปัดเป็นหลักสิบ
}

/** ดึง quote ปัจจุบัน — เดินราคาไปอีก 1 step ทุกครั้งที่เรียก */
export function getMockQuote(): GoldQuote {
  // รีเซ็ต metric เมื่อข้ามวัน
  if (startOfDay(Date.now()) !== dayStart) {
    dayStart = startOfDay(Date.now());
    dayOpen = currentSpot;
    dayHigh = currentSpot;
    dayLow = currentSpot;
  }

  currentSpot = nextStep(currentSpot, 1.2);
  dayHigh = Math.max(dayHigh, currentSpot);
  dayLow = Math.min(dayLow, currentSpot);

  const change = currentSpot - dayOpen;
  const changePercent = (change / dayOpen) * 100;

  const thaiBase = spotToThaiBaht(currentSpot);

  return {
    spotUsd: round2(currentSpot),
    usdThb: USD_THB,
    thaiSell: thaiBase + THAI_SPREAD, // ลูกค้าซื้อ (ราคาขายออกของร้าน)
    thaiBuy: thaiBase - THAI_SPREAD, // ลูกค้าขาย (ราคารับซื้อของร้าน)
    change: round2(change),
    changePercent: round2(changePercent),
    dayHigh: round2(dayHigh),
    dayLow: round2(dayLow),
    dayOpen: round2(dayOpen),
    timestamp: Date.now(),
  };
}

interface RangeConfig {
  points: number; // จำนวนจุด
  stepMs: number; // ระยะห่างต่อจุด
  volatility: number;
}

const RANGE_CONFIG: Record<TimeRange, RangeConfig> = {
  "1H": { points: 60, stepMs: 60_000, volatility: 0.5 }, // ทุก 1 นาที
  "1D": { points: 96, stepMs: 15 * 60_000, volatility: 1.0 }, // ทุก 15 นาที
  "1W": { points: 7 * 24, stepMs: 60 * 60_000, volatility: 2.0 }, // ทุก 1 ชม.
  "1M": { points: 30, stepMs: 24 * 60 * 60_000, volatility: 6.0 }, // รายวัน
  "1Y": { points: 52, stepMs: 7 * 24 * 60 * 60_000, volatility: 18.0 }, // รายสัปดาห์
};

/** สร้างประวัติราคาแบบ deterministic-ish ย้อนหลังตามช่วงเวลา */
export function getMockHistory(range: TimeRange): HistoryResponse {
  const cfg = RANGE_CONFIG[range];
  const now = Date.now();
  const points: PricePoint[] = [];
  const candles: Candle[] = [];

  // เดินย้อนจากปัจจุบันกลับไปอดีต แล้วกลับด้านให้เรียงเวลา
  let price = currentSpot;
  const reversed: PricePoint[] = [];
  for (let i = 0; i < cfg.points; i++) {
    const time = now - i * cfg.stepMs;
    reversed.push({ time, price: round2(price) });
    price = nextStep(price, cfg.volatility);
  }
  reversed.reverse();
  points.push(...reversed);

  // สร้าง OHLC จากจุดราคา (รวมเป็นแท่งตามช่วง)
  const bucket = Math.max(1, Math.floor(points.length / Math.min(points.length, 30)));
  for (let i = 0; i < points.length; i += bucket) {
    const slice = points.slice(i, i + bucket);
    if (slice.length === 0) continue;
    const prices = slice.map((p) => p.price);
    candles.push({
      time: slice[0].time,
      open: prices[0],
      high: round2(Math.max(...prices)),
      low: round2(Math.min(...prices)),
      close: prices[prices.length - 1],
    });
  }

  return { range, points, candles };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const MOCK_META = { BASE_SPOT, USD_THB, BAHT_GOLD_G };
