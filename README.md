# 🪙 Gold Dashboard — ติดตามราคาทองคำ Real-time

Dashboard ติดตามราคาทองคำแบบ Real-time สำหรับ **Gold Spot (XAU/USD)** และ **ทองคำไทย 96.5%**
สร้างด้วย **Next.js (App Router) + TypeScript + Tailwind CSS + Recharts**
รองรับ Dark Mode, Responsive และ **รันได้ทันทีด้วยข้อมูล Mock** (ไม่ต้องมี API key)

---

## ✨ ฟีเจอร์

| หมวด | รายละเอียด |
|------|-----------|
| **ราคา Real-time** | Gold Spot (XAU/USD), ทองไทย 96.5% (ราคาซื้อ/ขาย), เวลาอัปเดตล่าสุด |
| **Dashboard Cards** | ราคาปัจจุบัน, การเปลี่ยนแปลง +/-, %, สูงสุด/ต่ำสุดของวัน, ไฮไลต์เมื่อราคาขยับ |
| **กราฟราคา** | Area/Line chart, เปลี่ยนช่วง 1H/1D/1W/1M/1Y, **Zoom & Pan** (Brush), เส้นราคา live + เส้นเป้าหมายแจ้งเตือน |
| **แจ้งเตือนราคา** | ตั้งราคาเป้าหมาย สูงกว่า/ต่ำกว่า, แจ้งเตือนผ่าน Browser Notification + Toast, บันทึกใน localStorage |
| **ตารางประวัติ** | OHLC (วันที่/เวลา, เปิด, สูงสุด, ต่ำสุด, ปิด) |
| **ดีไซน์** | Glassmorphism, โทนดำ-ทอง-เขียว/แดง, Loading Skeleton, Error State, Dark/Light Mode |

---

## 🚀 เริ่มใช้งาน

```bash
cd gold-dashboard
npm install
npm run dev
```

เปิด http://localhost:3000

> ค่าเริ่มต้นใช้ **โหมด Mock** สร้างราคาจำลองแบบ random-walk — ใช้ทดสอบได้ทันทีโดยไม่ต้องมี API key

---

## 🔌 เชื่อมต่อ API ราคาทองจริง

คัดลอก `.env.example` เป็น `.env.local` แล้วตั้งค่า:

```env
NEXT_PUBLIC_DATA_MODE=live
GOLD_PROVIDER=goldapi        # goldapi | metals-api | alpha-vantage
GOLDAPI_KEY=your_key_here
```

รองรับผู้ให้บริการ (ดู [`src/lib/providers.ts`](src/lib/providers.ts)):

- **GoldAPI.io** — https://www.goldapi.io
- **Metals-API** — https://metals-api.com
- **Alpha Vantage** — https://www.alphavantage.co

ทุก provider ถูก map มาเป็น `GoldQuote` รูปแบบเดียวกัน หาก live ล้มเหลวจะ fallback กลับเป็น mock อัตโนมัติ เพื่อไม่ให้ UI พัง

---

## 📁 โครงสร้างโปรเจกต์ (Clean Architecture)

```
src/
├── app/
│   ├── api/gold/route.ts            # API ราคาปัจจุบัน (mock/live)
│   ├── api/gold/history/route.ts    # API ประวัติราคา (OHLC + points)
│   ├── layout.tsx                   # Root layout + ThemeProvider
│   ├── page.tsx                     # หน้าหลัก
│   └── globals.css                  # Theme tokens (ดำ-ทอง) + utilities
├── components/
│   ├── ui/                          # Primitives สไตล์ shadcn (card, button, badge, …)
│   └── dashboard/                   # Header, PriceCard, GoldChart, PriceAlerts, HistoryTable, …
├── hooks/
│   ├── useGoldPrice.ts              # Polling ราคา real-time + ตรวจทิศทาง tick
│   ├── useGoldHistory.ts            # โหลดประวัติตามช่วงเวลา
│   └── usePriceAlerts.ts            # จัดการแจ้งเตือน + localStorage + Notification
├── lib/
│   ├── types.ts                     # โดเมนไทป์ทั้งหมด
│   ├── mock.ts                      # เครื่องจำลองราคา (random-walk)
│   ├── providers.ts                 # Adapter ของ API จริง (server-only)
│   ├── api.ts                       # Client data layer
│   ├── format.ts                    # ฟอร์แมต USD/THB/%/เวลา
│   └── utils.ts                     # cn()
└── providers/ThemeProvider.tsx      # next-themes
```

---

## 🔄 อัปเกรดเป็น WebSocket จริง

ปัจจุบันราคา real-time ใช้ **polling ทุก 3 วินาที** ใน [`useGoldPrice.ts`](src/hooks/useGoldPrice.ts)
หากผู้ให้บริการรองรับ WebSocket ให้แทนที่ส่วน `setInterval` ด้วย:

```ts
const ws = new WebSocket("wss://your-provider/stream");
ws.onmessage = (ev) => setQuote(JSON.parse(ev.data));
return () => ws.close();
```

โครงสร้าง state/ทิศทาง tick รองรับการเปลี่ยนได้ทันทีโดยไม่ต้องแก้ UI

---

## 🛠️ เทคโนโลยี

Next.js 14 · React 18 · TypeScript 5 · Tailwind CSS 3 · Recharts · next-themes · lucide-react
