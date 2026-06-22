"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

interface Profile {
  wins: number;
  losses: number;
  pushes: number;
  points: number;
  streak: number;
  streak_type: string;
  longest_win_streak: number;
  rank: number | null;
}

interface Pick {
  pick_type: string;
  result: string;
  points_earned: number;
  created_at: string;
  games: { sport: string } | null;
}

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: picksData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("picks").select("*, games(sport)").eq("user_id", user.id).not("result", "eq", "pending"),
      ]);

      if (profileData) setProfile(profileData);
      if (picksData) setPicks(picksData);
      setLoading(false);
    }
    load();
  }, []);

  const total = picks.length;
  const wins = picks.filter((p) => p.result === "win").length;
  const losses = picks.filter((p) => p.result === "loss").length;
  const winRate = total > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 0;

  const bySport = ["NFL", "NBA", "MLB", "NHL"].map((sport) => {
    const sportPicks = picks.filter((p) => p.games?.sport === sport);
    const w = sportPicks.filter((p) => p.result === "win").length;
    const l = sportPicks.filter((p) => p.result === "loss").length;
    const emojis: Record<string, string> = { NFL: "🏈", NBA: "🏀", MLB: "⚾", NHL: "🏒" };
    return { sport, emoji: emojis[sport], wins: w, losses: l, winRate: w + l > 0 ? Math.round((w / (w + l)) * 100) : 0 };
  }).filter((s) => s.wins + s.losses > 0);

  const byType = ["spread", "ml", "total"].map((type) => {
    const typePicks = picks.filter((p) => p.pick_type === type);
    const w = typePicks.filter((p) => p.result === "win").length;
    const l = typePicks.filter((p) => p.result === "loss").length;
    const labels: Record<string, string> = { spread: "Spread", ml: "Moneyline", total: "Total (O/U)" };
    return { type: labels[type], wins: w, losses: l, winRate: w + l > 0 ? Math.round((w / (w + l)) * 100) : 0 };
  }).filter((t) => t.wins + t.losses > 0);

  if (loading) {
    return <AppShell><div className="max-w-4xl mx-auto px-4 py-6 space-y-4">{[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse" />)}</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Your Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Your pick performance</p>
        </div>

        {total === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-white font-semibold mb-2">No stats yet</div>
            <div className="text-slate-400 text-sm mb-4">Make some picks and come back once games complete.</div>
            <a href="/picks" className="text-[#38bdf8] text-sm hover:underline">Make picks →</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Win Rate", value: `${winRate}%`, color: "text-[#38bdf8]", sub: `${wins}W - ${losses}L - ${picks.filter(p => p.result === "push").length}P` },
                { label: "Total Picks", value: total, color: "text-white", sub: "All graded picks" },
                { label: "Points", value: (profile?.points ?? 0).toLocaleString(), color: "text-green-400", sub: "Lifetime points" },
                { label: "Streak", value: profile?.streak ? `${profile.streak}${profile.streak_type} 🔥` : "—", color: "text-orange-400", sub: `Best: ${profile?.longest_win_streak ?? 0}W` },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>

            {bySport.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4">By Sport</h3>
                <div className="space-y-3">
                  {bySport.map((s) => (
                    <div key={s.sport}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.emoji}</span>
                          <span className="text-sm font-medium text-white">{s.sport}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#38bdf8]">{s.winRate}%</span>
                          <span className="text-xs text-slate-500 ml-2">{s.wins}-{s.losses}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#152d52] rounded-full overflow-hidden">
                        <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: `${s.winRate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {byType.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4">By Pick Type</h3>
                <div className="space-y-3">
                  {byType.map((t) => (
                    <div key={t.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{t.type}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#38bdf8]">{t.winRate}%</span>
                          <span className="text-xs text-slate-500 ml-2">{t.wins}-{t.losses}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#152d52] rounded-full overflow-hidden">
                        <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: `${t.winRate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
