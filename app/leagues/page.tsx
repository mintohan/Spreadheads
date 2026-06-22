"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { leagues, leaderboard } from "../data/placeholder";

const EMOJIS = ["🏆", "🦈", "🏀", "🏈", "⚾", "🏒", "🎓", "🔥", "⚡", "💯", "🌊", "🎯"];

interface LeagueForm {
  name: string;
  description: string;
  sport: string;
  emoji: string;
  privacy: "public" | "private";
  type: "season" | "weekly" | "daily";
  maxMembers: number;
  prize: string;
}

export default function LeaguesPage() {
  const [joined, setJoined] = useState<Record<string, boolean>>(
    Object.fromEntries(leagues.map((l) => [l.id, l.joined]))
  );
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [showCreate, setShowCreate] = useState(false);
  const [viewLeague, setViewLeague] = useState<string | null>(null);
  const [createdLeagues, setCreatedLeagues] = useState<typeof leagues>([]);
  const [form, setForm] = useState<LeagueForm>({
    name: "",
    description: "",
    sport: "Multi",
    emoji: "🏆",
    privacy: "private",
    type: "season",
    maxMembers: 12,
    prize: "",
  });

  const allLeagues = [...leagues, ...createdLeagues];
  const myLeagues = allLeagues.filter((l) => joined[l.id]);
  const publicLeagues = allLeagues.filter((l) => l.privacy === "public" && !joined[l.id]);

  function handleJoin(id: string) {
    setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleCreate() {
    if (!form.name.trim()) return;
    const newLeague = {
      id: `l_${Date.now()}`,
      name: form.name,
      description: form.description || "A new league on SpreadHeads.",
      commissioner: "Jordan Rivers",
      members: 1,
      maxMembers: form.maxMembers,
      sport: form.sport,
      emoji: form.emoji,
      color: "#38bdf8",
      type: form.type,
      privacy: form.privacy,
      joined: true,
      myRank: 1,
      prize: form.prize || "Bragging rights",
      season: "2025-2026",
    };
    setCreatedLeagues((prev) => [...prev, newLeague]);
    setJoined((prev) => ({ ...prev, [newLeague.id]: true }));
    setShowCreate(false);
    setForm({ name: "", description: "", sport: "Multi", emoji: "🏆", privacy: "private", type: "season", maxMembers: 12, prize: "" });
    setActiveTab("my");
  }

  const viewing = viewLeague ? allLeagues.find((l) => l.id === viewLeague) : null;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* League detail modal */}
        {viewing && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/90 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#0a1628] border border-[#152d52] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${viewing.color}22, ${viewing.color}44)` }}>
                <div className="absolute inset-0 flex items-center justify-center text-5xl">{viewing.emoji}</div>
                <button onClick={() => setViewLeague(null)} className="absolute top-3 right-3 text-white/70 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-xl font-bold text-white">{viewing.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full border ${viewing.privacy === "public" ? "text-green-400 border-green-400/30" : "text-amber-400 border-amber-400/30"}`}>
                    {viewing.privacy === "public" ? "🌐 Public" : "🔒 Private"}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{viewing.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#060d18] rounded-xl p-3 text-center">
                    <div className="text-white font-bold">{viewing.members}/{viewing.maxMembers}</div>
                    <div className="text-xs text-slate-500">Members</div>
                  </div>
                  <div className="bg-[#060d18] rounded-xl p-3 text-center">
                    <div className="text-white font-bold capitalize">{viewing.type}</div>
                    <div className="text-xs text-slate-500">Format</div>
                  </div>
                  <div className="bg-[#060d18] rounded-xl p-3 text-center">
                    <div className="text-white font-bold">{viewing.sport}</div>
                    <div className="text-xs text-slate-500">Sport</div>
                  </div>
                </div>
                <div className="bg-[#060d18] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500">Commissioner</div>
                    <div className="text-sm text-white">{viewing.commissioner}</div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500">Prize</div>
                    <div className="text-sm text-amber-400">{viewing.prize}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">Season</div>
                    <div className="text-sm text-white">{viewing.season}</div>
                  </div>
                </div>
                {joined[viewing.id] && viewing.myRank && (
                  <div className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl p-3 mb-4 text-center">
                    <div className="text-[#38bdf8] font-bold text-lg">#{viewing.myRank}</div>
                    <div className="text-xs text-slate-400">Your Current Rank</div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => { handleJoin(viewing.id); setViewLeague(null); }}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      joined[viewing.id]
                        ? "bg-[#152d52] text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]"
                    }`}
                  >
                    {joined[viewing.id] ? "Leave League" : "Join League"}
                  </button>
                  <button onClick={() => setViewLeague(null)} className="px-4 py-2.5 border border-[#152d52] text-slate-400 rounded-xl text-sm hover:text-white">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/90 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#0a1628] border border-[#152d52] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white">Create League</h2>
                  <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">League Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. The Shark Tank"
                      className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="What's this league about?"
                      rows={2}
                      className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Emoji</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                          className={`w-10 h-10 text-xl rounded-lg border transition-all ${form.emoji === e ? "border-[#38bdf8] bg-[#38bdf8]/10" : "border-[#152d52] hover:border-[#38bdf8]/40"}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Sport</label>
                      <select value={form.sport} onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value }))} className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                        {["NBA", "NFL", "MLB", "NHL", "NCAAF", "Multi"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Format</label>
                      <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as LeagueForm["type"] }))} className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                        <option value="season">Season-long</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Max Members</label>
                      <input
                        type="number"
                        min={2}
                        max={1000}
                        value={form.maxMembers}
                        onChange={(e) => setForm((p) => ({ ...p, maxMembers: parseInt(e.target.value) || 12 }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#38bdf8]/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Prize (optional)</label>
                      <input
                        value={form.prize}
                        onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))}
                        placeholder="e.g. $100 prize pool"
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["private", "public"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setForm((prev) => ({ ...prev, privacy: p }))}
                          className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                            form.privacy === p ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"
                          }`}
                        >
                          {p === "public" ? "🌐 Public" : "🔒 Private"}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {form.privacy === "private" ? "Invite-only. Share the link to invite friends." : "Anyone can find and join this league."}
                    </p>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!form.name.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 ${
                      form.name.trim() ? "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]" : "bg-[#152d52] text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Create League
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🏆 Leagues</h1>
            <p className="text-slate-400 text-sm mt-1">Compete with friends and the world</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all"
          >
            + Create
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["my", "discover"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "my" ? `My Leagues (${myLeagues.length})` : "Discover"}
            </button>
          ))}
        </div>

        {activeTab === "my" && (
          <div className="space-y-5">
            {myLeagues.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🏆</div>
                <div className="text-slate-400">You haven&#39;t joined any leagues yet.</div>
                <button onClick={() => setActiveTab("discover")} className="mt-4 text-[#38bdf8] text-sm hover:underline">Browse leagues →</button>
              </div>
            ) : (
              myLeagues.map((league) => (
                <div key={league.id} className="card p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${league.color}22` }}>
                      {league.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white">{league.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${league.privacy === "private" ? "text-amber-400 border-amber-400/30" : "text-green-400 border-green-400/30"}`}>
                          {league.privacy === "private" ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{league.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-[#060d18] rounded-lg p-2.5 text-center">
                      <div className="text-white font-bold text-sm">{league.members}/{league.maxMembers}</div>
                      <div className="text-[10px] text-slate-500">Members</div>
                    </div>
                    <div className="bg-[#060d18] rounded-lg p-2.5 text-center">
                      <div className="text-[#38bdf8] font-bold text-sm">{league.myRank ? `#${league.myRank}` : "—"}</div>
                      <div className="text-[10px] text-slate-500">My Rank</div>
                    </div>
                    <div className="bg-[#060d18] rounded-lg p-2.5 text-center">
                      <div className="text-white font-bold text-sm capitalize">{league.type}</div>
                      <div className="text-[10px] text-slate-500">Format</div>
                    </div>
                    <div className="bg-[#060d18] rounded-lg p-2.5 text-center">
                      <div className="text-amber-400 font-bold text-xs leading-snug">{league.sport}</div>
                      <div className="text-[10px] text-slate-500">Sport</div>
                    </div>
                  </div>
                  {/* Mini leaderboard */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Standings</div>
                    <div className="space-y-1.5">
                      {leaderboard.slice(0, 3).map((entry) => (
                        <div key={entry.rank} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-5">#{entry.rank}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-[#060d18]" style={{ background: entry.avatarColor }}>
                            {entry.avatar}
                          </div>
                          <span className="text-xs text-white flex-1">{entry.name}</span>
                          <span className="text-xs text-slate-400">{entry.points.toLocaleString()} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewLeague(league.id)} className="flex-1 py-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium rounded-lg hover:bg-[#38bdf8]/20 transition-all">
                      View Details
                    </button>
                    {league.privacy === "private" && (
                      <button className="px-3 py-2 border border-[#152d52] text-slate-400 text-xs rounded-lg hover:text-white transition-colors">
                        📋 Copy Invite
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "discover" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {publicLeagues.map((league) => (
                <div key={league.id} className="card card-hover p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${league.color}22` }}>
                      {league.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{league.name}</div>
                      <div className="text-xs text-slate-500">{league.members.toLocaleString()} / {league.maxMembers} members</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{league.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">{league.prize}</span>
                    <span className="text-xs text-slate-500 capitalize">{league.type}</span>
                  </div>
                  <button
                    onClick={() => { handleJoin(league.id); setActiveTab("my"); }}
                    className="w-full py-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium rounded-lg hover:bg-[#38bdf8]/20 transition-all"
                  >
                    Join League
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
