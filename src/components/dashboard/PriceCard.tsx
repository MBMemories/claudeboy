"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PriceCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  change?: number; // ใช้กำหนดสีและไอคอนทิศทาง
  changeText?: string;
  tick?: 0 | 1 | -1; // ไฮไลต์ชั่วขณะเมื่อราคาขยับ
  loading?: boolean;
  accent?: "gold" | "neutral";
}

export function PriceCard({
  label,
  value,
  sub,
  icon: Icon,
  change,
  changeText,
  tick = 0,
  loading,
  accent = "neutral",
}: PriceCardProps) {
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const isUp = (change ?? 0) > 0;
  const isDown = (change ?? 0) < 0;
  const Dir = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <Card
      className={cn(
        "group relative animate-fade-in overflow-hidden transition-colors duration-500",
        tick === 1 && "ring-1 ring-up/50",
        tick === -1 && "ring-1 ring-down/50",
      )}
    >
      {/* เส้นทองด้านบน */}
      <div className="gold-line absolute inset-x-0 top-0 h-px opacity-60" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4",
                accent === "gold" ? "text-gold" : "text-muted-foreground",
              )}
            />
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums tracking-tight transition-colors duration-300",
              tick === 1 && "text-up",
              tick === -1 && "text-down",
            )}
          >
            {value}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          {changeText && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-sm font-semibold tabular-nums",
                isUp && "text-up",
                isDown && "text-down",
                !isUp && !isDown && "text-muted-foreground",
              )}
            >
              {(isUp || isDown) && <Dir className="h-4 w-4" />}
              {changeText}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
