"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { notifications } from "../data/placeholder";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/picks", label: "Picks", icon: "🎯" },
  { href: "/communities", label: "Communities", icon: "👥" },
  { href: "/leagues", label: "Leagues", icon: "🏆" },
  { href: "/articles", label: "Articles", icon: "📰" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/friends", label: "Friends", icon: "🤝" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#060d18]/95 backdrop-blur border-b border-[#152d52]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🦈</span>
            <span className="font-bold text-white text-base">SpreadHeads</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
            >
              🔔
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#38bdf8] rounded-full text-[9px] font-bold text-[#060d18] flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-xs font-bold text-[#060d18]">
              JR
            </Link>
          </div>
        </div>

        {/* Notification dropdown */}
        {showNotifs && (
          <div className="absolute top-14 right-2 w-72 bg-[#0a1628] border border-[#152d52] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#152d52] text-sm font-semibold text-white">Notifications</div>
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 text-sm border-b border-[#152d52]/50 ${!n.read ? "bg-[#38bdf8]/5" : ""}`}>
                <div className={`${!n.read ? "text-white" : "text-slate-400"}`}>{n.message}</div>
                <div className="text-xs text-slate-500 mt-0.5">{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060d18]/95 backdrop-blur border-t border-[#152d52]">
        <div className="flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] gap-0.5 transition-colors ${
                  active ? "text-[#38bdf8]" : "text-slate-500"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
