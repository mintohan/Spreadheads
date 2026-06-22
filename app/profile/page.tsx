"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  points: number;
  wins: number;
  losses: number;
  rank: number | null;
  created_at: string;
}

interface Pick {
  id: string;
  pick_label: string;
  result: string;
  points_earned: number;
  created_at: string;
  games: { home_team: string; away_team: string } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [editing, setEditing] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [activeTab, setActiveTab] = useState<"picks" | "settings">("picks");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: picksData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("picks").select("*, games(home_team, away_team)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      if (profileData) { setProfile(profileData); setTempBio(profileData.bio); }
      if (picksData) setPicks(picksData);
      setLoading(false);
    }
    load();
  }, []);

  async function saveBio() {
    if (!profile) return;
    await supabase.from("profiles").update({ bio: tempBio }).eq("id", profile.id);
    setProfile((p) => p ? { ...p, bio: tempBio } : p);
    setEditing(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  const winRate = profile ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100) : 0;
  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || "?";

  if (loading) {
    return <AppShell><div className="max-w-3xl mx-auto px-4 py-6 space-y-4">{[1,2].map(i => <div key={i} className="card h-32 animate-pulse" />)}</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#060d18] flex-shrink-0"
              style={{ background: profile?.avatar_color || "#38bdf8" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{profile?.display_name}</h1>
                  <div className="text-slate-500 text-sm">@{profile?.username}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Joined {profile ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}
                  </div>
                </div>
                <button onClick={() => setEditing(!editing)}
                  className="text-xs border border-[#152d52] text-slate-400 px-3 py-1.5 rounded-lg hover:text-white transition-colors flex-shrink-0">
                  {editing ? "Cancel" : "Edit Bio"}
                </button>
              </div>
              {editing ? (
                <div className="mt-3 space-y-2">
                  <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} rows={3}
                    className="w-full bg-[#060d18] border border-[#152d52] focus:border-[#38bdf8]/50 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none" />
                  <button onClick={saveBio} className="text-xs bg-[#38bdf8] text-[#060d18] font-semibold px-4 py-1.5 rounded-lg">Save</button>
                </div>
              ) : (
                <p className="text-slate-400 text-sm mt-3">{profile?.bio || <span className="text-slate-600 italic">No bio yet. Click Edit Bio to add one.</span>}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#152d52]">
            {[
              { value: `${winRate}%`, label: "Win Rate", color: "text-[#38bdf8]" },
              { value: `${profile?.wins ?? 0}-${profile?.losses ?? 0}`, label: "Record", color: "text-white" },
              { value: profile?.rank ? `#${profile.rank}` : "—", label: "Rank", color: "text-amber-400" },
              { value: (profile?.points ?? 0).toLocaleString(), label: "Points", color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-5 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["picks", "settings"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "picks" && (
          <div className="space-y-2">
            {picks.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-slate-400 text-sm">No picks yet.</div>
                <a href="/picks" className="text-[#38bdf8] text-sm hover:underline mt-2 block">Make your first pick →</a>
              </div>
            ) : picks.map((pick) => (
              <div key={pick.id} className="card p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  pick.result === "win" ? "bg-green-500/20 text-green-400" :
                  pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                  pick.result === "pending" ? "bg-[#38bdf8]/20 text-[#38bdf8]" :
                  "bg-slate-500/20 text-slate-400"
                }`}>
                  {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : pick.result === "pending" ? "⏳" : "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {pick.games ? `${pick.games.away_team} @ ${pick.games.home_team}` : "Game"}
                  </div>
                  <div className="text-xs text-slate-500">{pick.pick_label} · {new Date(pick.created_at).toLocaleDateString()}</div>
                </div>
                <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-400"}`}>
                  {pick.result === "win" ? `+${pick.points_earned}` : pick.result === "push" ? "Push" : pick.result === "pending" ? "Pending" : "−0"}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Account</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Username</span>
                <span className="text-white">@{profile?.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Points</span>
                <span className="text-white">{(profile?.points ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={handleSignOut}
              className="w-full py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
