import { NextRequest, NextResponse } from "next/server";
import { getMockHistory } from "@/lib/mock";
import type { TimeRange } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: TimeRange[] = ["1H", "1D", "1W", "1M", "1Y"];

/**
 * GET /api/gold/history?range=1D
 * คืนประวัติราคา (line points + OHLC candles) ตามช่วงเวลา
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("range") ?? "1D";
  const range = (VALID.includes(raw as TimeRange) ? raw : "1D") as TimeRange;

  // หมายเหตุ: history จาก provider จริงต้องใช้ time-series endpoint แยก
  // ตัวอย่างนี้ใช้ mock history เสมอเพื่อให้กราฟทำงานได้ทันที
  return NextResponse.json(getMockHistory(range), {
    headers: { "Cache-Control": "no-store" },
  });
}
