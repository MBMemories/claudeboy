import { NextResponse } from "next/server";
import { getMockQuote } from "@/lib/mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/gold
 * คืนราคาทองปัจจุบัน (Gold Spot + ทองไทย 96.5%)
 * - โหมด "live" (ค่าเริ่มต้น): ดึงราคาจริง
 *     · ถ้าตั้ง GOLD_PROVIDER + API key → ใช้ provider นั้น (GoldAPI/Metals-API/Alpha Vantage)
 *     · ไม่งั้นใช้แหล่งฟรีไม่ต้องใช้ key (gold-api.com + open.er-api.com)
 * - โหมด "mock": ใช้ราคาจำลอง (ตั้ง NEXT_PUBLIC_DATA_MODE=mock)
 */
export async function GET() {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "live";

  if (mode !== "mock") {
    try {
      const provider = process.env.GOLD_PROVIDER;
      // มี provider แบบมี key ที่ตั้งค่าไว้
      if (provider && provider !== "free") {
        const { fetchLiveQuote } = await import("@/lib/providers");
        return NextResponse.json(await fetchLiveQuote(), {
          headers: { "Cache-Control": "no-store" },
        });
      }
      // ค่าเริ่มต้น: แหล่งฟรีไม่ต้องใช้ key
      const { getLiveQuote } = await import("@/lib/liveStore");
      return NextResponse.json(await getLiveQuote(), {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (err) {
      // ถ้า live ล้มเหลว fallback เป็น mock เพื่อไม่ให้ UI พัง
      console.error("[/api/gold] live failed, fallback to mock:", err);
    }
  }

  return NextResponse.json(getMockQuote(), {
    headers: { "Cache-Control": "no-store" },
  });
}
