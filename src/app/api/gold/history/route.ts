import { NextRequest, NextResponse } from "next/server";
import { getMockHistory } from "@/lib/mock";
import type { TimeRange } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: TimeRange[] = ["1H", "1D", "1W", "1M", "1Y"];

/**
 * GET /api/gold/history?range=1D
 * คืนประวัติราคา (line points + OHLC candles) ตามช่วงเวลา
 *
 * หมายเหตุ: แหล่งราคาฟรีไม่มี time-series ย้อนหลัง จึงสร้างประวัติแบบจำลอง
 * แต่ "anchor" ไว้ที่ราคาจริงล่าสุด เพื่อให้กราฟ/ตารางอยู่รอบ ๆ ราคาตลาดจริง
 * (หากต้องการประวัติจริง ต้องต่อ provider ที่มี time-series endpoint แยก)
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("range") ?? "1D";
  const range = (VALID.includes(raw as TimeRange) ? raw : "1D") as TimeRange;

  let anchor: number | undefined;
  if ((process.env.NEXT_PUBLIC_DATA_MODE ?? "live") !== "mock") {
    try {
      const { getLiveSpot } = await import("@/lib/liveStore");
      anchor = await getLiveSpot();
    } catch {
      /* ดึงราคาจริงไม่ได้ → ใช้ราคาฐานของ mock */
    }
  }

  return NextResponse.json(getMockHistory(range, anchor), {
    headers: { "Cache-Control": "no-store" },
  });
}
