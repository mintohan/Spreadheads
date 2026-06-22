"use client";

import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

interface Profile {
  display_name: string;
  username: string;
  avatar_color: string;
  wins: number;
  losses: number;
  pushes: number;
  points: number;
  streak: number;
  streak_type: string;
  rank: number | null;
}

interface Game {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  spread: string;
  game_time: string;
  locked: boolean;
  logo: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  image: string;
  read_time: string;
  like_count: number;
  trending: boolean;
}

interface Pick {
  id: string;
  pick_label: string;
  result: string;
  points_earned: number;
  created_at: string;
  games: { home_team: string; away_team: string } | null;
}

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [recentPicks, setRecentPicks] = useState<Pick[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: gamesData }, { data: picksData }, { data: articlesData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("games")
          .select("*")
          .gte("game_time", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
          .lte("game_time", new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString())
          .order("game_time").limit(4),
        supabase.from("picks")
          .select("*, games(home_team, away_team)")
          .eq("user_id", user.id)
          .not("result", "eq", "pending")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase.from("articles").select("id, title, category, image, read_time, like_count, trending").order("published_at", { ascending: false }).limit(3),
      ]);

      if (profileData) setProfile(profileData);
      if (gamesData) setGames(gamesData);
      if (picksData) setRecentPicks(picksData);
      if (articlesData) setArticles(articlesData);
      setLoading(false);
    }
    load();
  }, []);

  const winRate = profile
    ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100)
    : 0;

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || "?";
  const upcomingGames = games.filter((g) => !g.locked).slice(0, 3);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0d1e35] to-[#152d52] border border-[#152d52] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[120px] leading-none opacity-10 select-none pointer-events-none">🦈</div>
          <div className="relative">
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mb-4">{profile?.display_name} 👋</h1>
            <div className="flex flex-wrap gap-3">
              {[
                { value: `${winRate}%`, label: "Win Rate", color: "text-[#38bdf8]" },
                { value: `${profile?.wins ?? 0}-${profile?.losses ?? 0}`, label: "Record", color: "text-white" },
                { value: profile?.streak ? `${profile.streak}${profile.streak_type} 🔥` : "—", label: "Streak", color: "text-green-400" },
                { value: profile?.rank ? `#${profile.rank}` : "Unranked", label: "Global Rank", color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#060d18]/60 rounded-xl px-4 py-2.5 border border-[#152d52]">
                  <div className={`font-bold text-xl ${stat.color}`}>{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's games */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-lg">Today&#39;s Games</h2>
                <Link href="/picks" className="text-[#38bdf8] text-sm hover:underline">Make Picks →</Link>
              </div>
              {upcomingGames.length === 0 ? (
                <div className="card p-6 text-center text-slate-400 text-sm">No upcoming games right now.</div>
              ) : (
                <div className="space-y-3">
                  {upcomingGames.map((game) => (
                    <div key={game.id} className="card card-hover p-4 flex items-center gap-4">
                      <div className="text-2xl">{game.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{game.away_team} @ {game.home_team}</div>
                        <div className="text-xs text-slate-500">{game.sport} · {formatTime(game.game_time)}</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400">Spread</div>
                        <div className="text-sm font-semibold text-[#38bdf8]">{game.spread}</div>
                      </div>
                      <Link href="/picks" className="bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
                        Pick
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent results */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-lg">Recent Results</h2>
                <Link href="/stats" className="text-[#38bdf8] text-sm hover:underline">All Stats →</Link>
              </div>
              {recentPicks.length === 0 ? (
                <div className="card p-6 text-center text-slate-400 text-sm">No pick results yet. <Link href="/picks" className="text-[#38bdf8] hover:underline">Make your first pick →</Link></div>
              ) : (
                <div className="space-y-2">
                  {recentPicks.map((pick) => (
                    <div key={pick.id} className="card p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        pick.result === "win" ? "bg-green-500/20 text-green-400" :
                        pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">
                          {pick.games ? `${pick.games.away_team} @ ${pick.games.home_team}` : "Game"}
                        </div>
                        <div className="text-xs text-slate-500">{pick.pick_label} · {new Date(pick.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-400"}`}>
                        {pick.result === "win" ? `+${pick.points_earned}` : pick.result === "push" ? "Push" : "−0"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Articles */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">📰 Latest</h3>
                <Link href="/articles" className="text-[#38bdf8] text-xs hover:underline">See all</Link>
              </div>
              <div className="space-y-3">
                {articles.map((a) => (
                  <Link key={a.id} href="/articles" className="flex items-start gap-3 group">
                    <span className="text-xl flex-shrink-0">{a.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white group-hover:text-[#38bdf8] transition-colors line-clamp-2 leading-snug">{a.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{a.category} · {a.read_time}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card p-4">
              <h3 className="font-semibold text-white mb-3">⚡ Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "Make Today's Picks", href: "/picks", icon: "🎯" },
                  { label: "Browse Communities", href: "/communities", icon: "👥" },
                  { label: "Join a League", href: "/leagues", icon: "🏆" },
                  { label: "Find Friends", href: "/friends", icon: "🤝" },
                ].map((action) => (
                  <Link key={action.href} href={action.href} className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#38bdf8] transition-colors p-2 rounded-lg hover:bg-[#38bdf8]/5">
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
