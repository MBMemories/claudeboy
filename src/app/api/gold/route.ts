import { NextResponse } from "next/server";
import { getMockQuote } from "@/lib/mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/gold
 * คืนราคาทองปัจจุบัน (Gold Spot + ทองไทย 96.5%)
 * - โหมด mock: สร้างราคาจำลอง (ค่าเริ่มต้น)
 * - โหมด live: ดึงจาก provider จริง (ต้องตั้งค่า env)
 */
export async function GET() {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";

  if (mode === "live") {
    try {
      const { fetchLiveQuote } = await import("@/lib/providers");
      const quote = await fetchLiveQuote();
      return NextResponse.json(quote, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (err) {
      // ถ้า live ล้มเหลว ให้ fallback เป็น mock เพื่อไม่ให้ UI พัง
      console.error("[/api/gold] live failed, fallback to mock:", err);
    }
  }

  return NextResponse.json(getMockQuote(), {
    headers: { "Cache-Control": "no-store" },
  });
}
