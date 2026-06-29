"use client";

import { Coins, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HeaderProps {
  lastUpdated?: number;
  connected: boolean;
  onRefresh: () => void;
}

export function Header({ lastUpdated, connected, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/20">
            <Coins className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight sm:text-lg">
              Gold Dashboard
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              ราคาทองคำ Real-time · XAU/USD &amp; ทองไทย 96.5%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={connected ? "up" : "down"} className="hidden sm:flex">
            {connected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
          </Badge>

          {lastUpdated && (
            <span className="hidden text-xs text-muted-foreground md:inline">
              อัปเดต {formatTime(lastUpdated)}
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label="รีเฟรช"
          >
            <RefreshCw className={cn("h-4 w-4", !connected && "animate-spin")} />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
