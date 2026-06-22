"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "../data/placeholder";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/picks", label: "Picks", icon: "🎯" },
  { href: "/communities", label: "Communities", icon: "👥" },
  { href: "/leagues", label: "Leagues", icon: "🏆" },
  { href: "/articles", label: "Articles", icon: "📰" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/friends", label: "Friends", icon: "🤝" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 border-r border-[#152d52] bg-[#060d18] z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#152d52]">
        <span className="text-2xl">🦈</span>
        <div>
          <div className="font-bold text-white text-lg leading-tight">SpreadHeads</div>
          <div className="text-[10px] text-[#38bdf8] uppercase tracking-widest font-medium">Pick&#39;em</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/25"
                  : "text-slate-400 hover:text-white hover:bg-[#0a1628]"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-[#152d52] p-3">
        <Link href="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
          pathname === "/profile" ? "bg-[#38bdf8]/15 border border-[#38bdf8]/25" : "hover:bg-[#0a1628]"
        }`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18] flex-shrink-0"
            style={{ background: currentUser.avatarColor }}
          >
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
            <div className="text-xs text-slate-500">@{currentUser.username}</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#38bdf8] font-semibold">{currentUser.winRate}%</span>
            <span className="text-[9px] text-slate-500">WIN</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
