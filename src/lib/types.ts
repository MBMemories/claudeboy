// ===== Domain Types =====

export type TimeRange = "1H" | "1D" | "1W" | "1M" | "1Y";

/** ราคา Gold Spot (XAU/USD) + ราคาทองไทย พร้อม metric ของวัน */
export interface GoldQuote {
  /** ราคา Gold Spot ต่อ troy ounce (USD) */
  spotUsd: number;
  /** อัตราแลกเปลี่ยน USD/THB ที่ใช้คำนวณ */
  usdThb: number;

  // ทองคำไทย 96.5% (บาททอง)
  thaiBuy: number; // ราคารับซื้อ (ร้านรับซื้อจากลูกค้า)
  thaiSell: number; // ราคาขายออก (ลูกค้าซื้อจากร้าน)

  // การเปลี่ยนแปลงเทียบกับราคาเปิดของวัน (อ้างอิง spot)
  change: number; // +/- USD
  changePercent: number; // +/- %

  // ช่วงราคาของวัน (spot)
  dayHigh: number;
  dayLow: number;
  dayOpen: number;

  /** เวลาอัปเดตล่าสุด (epoch ms) */
  timestamp: number;
}

/** จุดข้อมูลกราฟแบบ OHLC สำหรับตารางประวัติ */
export interface Candle {
  time: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
}

/** จุดข้อมูลกราฟเส้น */
export interface PricePoint {
  time: number; // epoch ms
  price: number;
}

export interface HistoryResponse {
  range: TimeRange;
  points: PricePoint[];
  candles: Candle[];
}

// ===== Price Alerts =====
export type AlertDirection = "above" | "below";

export interface PriceAlert {
  id: string;
  /** ราคาเป้าหมาย (อ้างอิง Gold Spot USD) */
  target: number;
  direction: AlertDirection;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}
