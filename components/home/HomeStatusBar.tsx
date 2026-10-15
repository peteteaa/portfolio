"use client";

import { useEffect, useState } from "react";

// 3DS HOME menu status bar: Wi-Fi, date, time and battery. The battery is the visitor's real one
// where the browser exposes it (Chromium), otherwise it shows full.

type BatteryInfo = { level: number; charging: boolean };
type BatteryManager = BatteryInfo & EventTarget;

export default function HomeStatusBar() {
  const [now, setNow] = useState(() => new Date());
  const [online, setOnline] = useState(true);
  const [battery, setBattery] = useState<BatteryInfo | null>(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 10_000);
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    let manager: BatteryManager | null = null;
    const readBattery = () => manager && setBattery({ level: manager.level, charging: manager.charging });
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    nav.getBattery?.()
      .then((b) => {
        manager = b;
        readBattery();
        b.addEventListener("levelchange", readBattery);
        b.addEventListener("chargingchange", readBattery);
      })
      .catch(() => {});

    return () => {
      clearInterval(tick);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      manager?.removeEventListener("levelchange", readBattery);
      manager?.removeEventListener("chargingchange", readBattery);
    };
  }, []);

  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const level = battery ? Math.round(battery.level * 100) : 100;
  const bars = online ? 3 : 0;

  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/70 px-3 py-1 text-lg md:text-xl leading-none text-foreground">
      <div className="flex items-end gap-[3px]" title={online ? "Online" : "Offline"} aria-label={online ? "Online" : "Offline"}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`inline-block w-[5px] rounded-[1px] ${i < bars ? "bg-[#00a8ff]" : "bg-foreground/25"}`} style={{ height: 6 + i * 5 }} />
        ))}
        <span className="ml-1">{online ? "Wi-Fi" : "Offline"}</span>
      </div>
      <span>{date}</span>
      <div className="flex items-center gap-2">
        <span>{time}</span>
        <span className="flex items-center" title={battery ? `Battery ${level}%${battery.charging ? " (charging)" : ""}` : "Battery"} aria-label={`Battery ${level}%`}>
          <span className="relative inline-block h-[13px] w-[26px] rounded-[2px] border-2 border-foreground/70 p-[1px]">
            <span className={`block h-full rounded-[1px] ${level <= 20 ? "bg-red-500" : "bg-[#00a8ff]"}`} style={{ width: `${level}%` }} />
          </span>
          <span className="h-[6px] w-[3px] rounded-r-[1px] bg-foreground/70" />
          {battery?.charging && <span className="ml-1">⚡</span>}
        </span>
      </div>
    </div>
  );
}
