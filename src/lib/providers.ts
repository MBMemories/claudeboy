import "server-only";
import type { GoldQuote } from "./types";

// ===== Live Gold Price Providers (server-side only) =====
// ใช้เมื่อ NEXT_PUBLIC_DATA_MODE=live และมี API key ที่ถูกต้อง
// รองรับ GoldAPI.io, Metals-API, Alpha Vantage
//
// หมายเหตุ: โครงสร้างนี้ออกแบบให้ map ผลลัพธ์ของแต่ละผู้ให้บริการ
// มาเป็น GoldQuote เดียวกัน เพื่อให้ฝั่ง UI ไม่ต้องรู้ว่ามาจากที่ใด

const TROY_OUNCE_G = 31.1035;
const BAHT_GOLD_G = 15.244;
const USD_THB_FALLBACK = 36.5;
const THAI_SPREAD = 50;

function toThaiQuote(spotUsd: number, usdThb: number, prevClose: number): GoldQuote {
  const thbPerGram = (spotUsd / TROY_OUNCE_G) * usdThb;
  const thaiBase = Math.round((thbPerGram * BAHT_GOLD_G) / 10) * 10;
  const change = spotUsd - prevClose;
  return {
    spotUsd: round2(spotUsd),
    usdThb,
    thaiSell: thaiBase + THAI_SPREAD,
    thaiBuy: thaiBase - THAI_SPREAD,
    change: round2(change),
    changePercent: round2((change / prevClose) * 100),
    dayHigh: round2(Math.max(spotUsd, prevClose)),
    dayLow: round2(Math.min(spotUsd, prevClose)),
    dayOpen: round2(prevClose),
    timestamp: Date.now(),
  };
}

/** GoldAPI.io — GET https://www.goldapi.io/api/XAU/USD */
async function fromGoldApi(key: string): Promise<GoldQuote> {
  const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
    headers: { "x-access-token": key, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GoldAPI error: ${res.status}`);
  const d = await res.json();
  // GoldAPI ส่ง price (per oz), prev_close_price, open_price
  const prevClose = d.prev_close_price ?? d.open_price ?? d.price;
  return toThaiQuote(d.price, USD_THB_FALLBACK, prevClose);
}

/** Metals-API — GET https://metals-api.com/api/latest?base=USD&symbols=XAU */
async function fromMetalsApi(key: string): Promise<GoldQuote> {
  const res = await fetch(
    `https://metals-api.com/api/latest?access_key=${key}&base=USD&symbols=XAU`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Metals-API error: ${res.status}`);
  const d = await res.json();
  if (!d.success) throw new Error(`Metals-API: ${d.error?.info ?? "unknown"}`);
  // rate = ราคา 1 USD ในหน่วย XAU -> spot = 1/rate
  const spot = 1 / d.rates.XAU;
  return toThaiQuote(spot, USD_THB_FALLBACK, spot);
}

/** Alpha Vantage — ใช้ FX/commodity endpoint (ตัวอย่าง CURRENCY_EXCHANGE_RATE) */
async function fromAlphaVantage(key: string): Promise<GoldQuote> {
  const res = await fetch(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${key}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`AlphaVantage error: ${res.status}`);
  const d = await res.json();
  const rate = d["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
  if (!rate) throw new Error("AlphaVantage: invalid response");
  const spot = Number(rate);
  return toThaiQuote(spot, USD_THB_FALLBACK, spot);
}

/** เลือก provider ตาม env แล้วคืน GoldQuote */
export async function fetchLiveQuote(): Promise<GoldQuote> {
  const provider = process.env.GOLD_PROVIDER ?? "goldapi";
  switch (provider) {
    case "metals-api": {
      const key = requireKey("METALS_API_KEY");
      return fromMetalsApi(key);
    }
    case "alpha-vantage": {
      const key = requireKey("ALPHA_VANTAGE_KEY");
      return fromAlphaVantage(key);
    }
    case "goldapi":
    default: {
      const key = requireKey("GOLDAPI_KEY");
      return fromGoldApi(key);
    }
  }
}

function requireKey(name: string): string {
  const key = process.env[name];
  if (!key) throw new Error(`Missing env ${name} for live mode`);
  return key;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
