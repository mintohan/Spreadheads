"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

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
  const router = useRouter();
  const supabase = createClient();
  const [initials, setInitials] = useState("?");
  const [avatarColor, setAvatarColor] = useState("#38bdf8");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("display_name, avatar_color").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) {
            setInitials(data.display_name.slice(0, 2).toUpperCase());
            setAvatarColor(data.avatar_color);
          }
        });
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#060d18]/95 backdrop-blur border-b border-[#152d52]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🦈</span>
            <span className="font-bold text-white text-base">SpreadHeads</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18]"
                style={{ background: avatarColor }}>
                {initials}
              </div>
            </Link>
            <button onClick={handleSignOut} className="text-slate-500 hover:text-red-400 text-sm transition-colors">
              🚪
            </button>
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060d18]/95 backdrop-blur border-t border-[#152d52]">
        <div className="flex">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] gap-0.5 transition-colors ${active ? "text-[#38bdf8]" : "text-slate-500"}`}>
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
