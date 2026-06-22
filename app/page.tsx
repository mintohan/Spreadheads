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
  const [inCommunities, setInCommunities] = useState(false);
  const [inLeagues, setInLeagues] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profileData },
        { data: gamesData },
        { data: picksData },
        { data: communityData },
        { data: leagueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("games")
          .select("*")
          .gte("game_time", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
          .lte("game_time", new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString())
          .order("game_time").limit(4),
        supabase.from("picks")
          .select("*, games(home_team, away_team)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase.from("community_members").select("community_id").eq("user_id", user.id).limit(1),
        supabase.from("league_members").select("league_id").eq("user_id", user.id).limit(1),
      ]);

      if (profileData) setProfile(profileData);
      if (gamesData) setGames(gamesData);
      if (picksData) setRecentPicks(picksData);
      setInCommunities((communityData?.length ?? 0) > 0);
      setInLeagues((leagueData?.length ?? 0) > 0);
      setLoading(false);
    }
    load();
  }, []);

  const isNewUser = !profile || (profile.wins === 0 && profile.losses === 0 && !inCommunities && !inLeagues);
  const winRate = profile ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100) : 0;
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

        {/* Hero — different for new vs returning users */}
        {isNewUser ? (
          <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0d1e35] to-[#152d52] border border-[#152d52] p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[140px] leading-none opacity-[0.07] select-none pointer-events-none">🦈</div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                <span className="text-[#38bdf8] text-xs font-medium">You&#39;re in — let&#39;s get started</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to SpreadHeads, {profile?.display_name} 🦈
              </h1>
              <p className="text-slate-400 mb-6 max-w-lg">
                Create a league with your friends, join a community, and compete to see who really knows sports. Picks are how you score — but leagues and communities are how you win.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/friends" className="bg-[#38bdf8] text-[#060d18] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all text-sm">
                  🤝 Add Friends
                </Link>
                <Link href="/leagues" className="bg-[#0a1628] border border-[#152d52] text-white font-medium px-5 py-2.5 rounded-xl hover:border-[#38bdf8]/40 transition-all text-sm">
                  🏆 Join a League
                </Link>
                <Link href="/communities" className="bg-[#0a1628] border border-[#152d52] text-white font-medium px-5 py-2.5 rounded-xl hover:border-[#38bdf8]/40 transition-all text-sm">
                  👥 Find a Community
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0d1e35] to-[#152d52] border border-[#152d52] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-10 select-none pointer-events-none">🦈</div>
            <div className="relative">
              <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
              <h1 className="text-2xl font-bold text-white mb-4">{profile?.display_name} 👋</h1>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: `${winRate}%`, label: "Win Rate", color: "text-[#38bdf8]" },
                  { value: `${profile?.wins}-${profile?.losses}`, label: "Record", color: "text-white" },
                  { value: profile?.streak ? `${profile.streak}${profile.streak_type} 🔥` : "—", label: "Streak", color: "text-green-400" },
                  { value: profile?.rank ? `#${profile.rank}` : "Unranked", label: "Rank", color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#060d18]/60 rounded-xl px-4 py-2.5 border border-[#152d52]">
                    <div className={`font-bold text-xl ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-500 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onboarding checklist for new users */}
        {isNewUser && (
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Get started</h2>
            <div className="space-y-3">
              {[
                { label: "Add a friend", href: "/friends", icon: "🤝", done: false, sub: "Search by username and connect" },
                { label: "Join or create a league", href: "/leagues", icon: "🏆", done: inLeagues, sub: "Compete on a leaderboard with your crew" },
                { label: "Join a community", href: "/communities", icon: "👥", done: inCommunities, sub: "Find groups to talk picks with" },
                { label: "Make your first pick", href: "/picks", icon: "🎯", done: recentPicks.length > 0, sub: "Pick the spread on today's games" },
              ].map((step) => (
                <Link key={step.href} href={step.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${step.done ? "border-green-500/20 bg-green-500/5" : "border-[#152d52] hover:border-[#38bdf8]/30 hover:bg-[#38bdf8]/5"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${step.done ? "bg-green-500 text-white" : "border border-[#152d52] text-slate-500"}`}>
                    {step.done ? "✓" : ""}
                  </div>
                  <span className="text-lg">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${step.done ? "text-slate-400 line-through" : "text-white"}`}>{step.label}</div>
                    {!step.done && <div className="text-xs text-slate-500 mt-0.5">{step.sub}</div>}
                  </div>
                  {!step.done && <span className="text-slate-500 text-xs flex-shrink-0">→</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Today's games */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-lg">Today&#39;s Games</h2>
                <Link href="/picks" className="text-[#38bdf8] text-sm hover:underline">All picks →</Link>
              </div>
              {upcomingGames.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="text-3xl mb-2">🏟️</div>
                  <div className="text-slate-400 text-sm">No games scheduled right now.</div>
                  <div className="text-slate-500 text-xs mt-1">Check back when games are added.</div>
                </div>
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

            {/* Recent picks — only show if they have some */}
            {recentPicks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-white text-lg">Recent Picks</h2>
                  <Link href="/stats" className="text-[#38bdf8] text-sm hover:underline">Stats →</Link>
                </div>
                <div className="space-y-2">
                  {recentPicks.map((pick) => (
                    <div key={pick.id} className="card p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        pick.result === "win" ? "bg-green-500/20 text-green-400" :
                        pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                        pick.result === "pending" ? "bg-[#38bdf8]/20 text-[#38bdf8]" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : pick.result === "pending" ? "·" : "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">
                          {pick.games ? `${pick.games.away_team} @ ${pick.games.home_team}` : "Game"}
                        </div>
                        <div className="text-xs text-slate-500">{pick.pick_label} · {new Date(pick.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-500"}`}>
                        {pick.result === "win" ? `+${pick.points_earned}` : pick.result === "push" ? "Push" : pick.result === "pending" ? "Pending" : "−0"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* How it works — only for new users */}
            {isNewUser && (
              <div className="card p-4">
                <h3 className="font-semibold text-white mb-3">How it works</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Add friends and create a league to compete head-to-head", icon: "🏆" },
                    { step: "2", text: "Join communities to talk picks and find competition", icon: "👥" },
                    { step: "3", text: "Pick the spread on daily games and earn points", icon: "🎯" },
                    { step: "4", text: "Top the leaderboard and prove you know sports", icon: "📈" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <span className="text-xs text-slate-400 leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card p-4">
              <h3 className="font-semibold text-white mb-3">⚡ Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "Make Today's Picks", href: "/picks", icon: "🎯" },
                  { label: "Browse Communities", href: "/communities", icon: "👥" },
                  { label: "Join a League", href: "/leagues", icon: "🏆" },
                  { label: "Find Friends", href: "/friends", icon: "🤝" },
                  { label: "Read Articles", href: "/articles", icon: "📰" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#38bdf8] transition-colors p-2 rounded-lg hover:bg-[#38bdf8]/5">
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
