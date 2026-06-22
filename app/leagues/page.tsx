"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

const EMOJIS = ["🏆", "🦈", "🏀", "🏈", "⚾", "🏒", "🎓", "🔥", "⚡", "💯", "🌊", "🎯"];

interface League {
  id: string;
  name: string;
  description: string;
  sport: string;
  emoji: string;
  color: string;
  privacy: string;
  format: string;
  commissioner_id: string;
  max_members: number;
  member_count: number;
  prize: string;
  season: string;
  invite_code: string;
}

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
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [myRanks, setMyRanks] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [showCreate, setShowCreate] = useState(false);
  const [viewLeague, setViewLeague] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<LeagueForm>({
    name: "", description: "", sport: "Multi", emoji: "🏆", privacy: "private", type: "season", maxMembers: 12, prize: "",
  });
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: memberships } = await supabase
      .from("league_members").select("league_id, rank").eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      const leagueIds = memberships.map((m) => m.league_id);
      const ranks: Record<string, number> = {};
      memberships.forEach((m) => { if (m.rank) ranks[m.league_id] = m.rank; });
      setMyRanks(ranks);

      const { data: leaguesData } = await supabase.from("leagues").select("*").in("id", leagueIds);
      if (leaguesData) setMyLeagues(leaguesData);
    }

    const joinedIds = (memberships || []).map((m) => m.league_id);
    const query = supabase.from("leagues").select("*").eq("privacy", "public");
    if (joinedIds.length > 0) query.not("id", "in", `(${joinedIds.join(",")})`);
    const { data: pubData } = await query;
    if (pubData) setPublicLeagues(pubData);

    setLoading(false);
  }

  async function handleJoin(leagueId: string) {
    if (!userId) return;
    await supabase.from("league_members").insert({ league_id: leagueId, user_id: userId });
    await supabase.from("leagues").update({ member_count: (publicLeagues.find(l => l.id === leagueId)?.member_count ?? 0) + 1 }).eq("id", leagueId);
    loadData();
  }

  async function handleLeave(leagueId: string) {
    if (!userId) return;
    await supabase.from("league_members").delete().eq("league_id", leagueId).eq("user_id", userId);
    loadData();
  }

  async function handleCreate() {
    if (!form.name.trim() || !userId) return;
    const { data, error } = await supabase.from("leagues").insert({
      name: form.name,
      description: form.description,
      sport: form.sport,
      emoji: form.emoji,
      privacy: form.privacy,
      format: form.type,
      max_members: form.maxMembers,
      prize: form.prize || "Bragging rights",
      commissioner_id: userId,
    }).select().single();

    if (data && !error) {
      await supabase.from("league_members").insert({ league_id: data.id, user_id: userId });
      setShowCreate(false);
      setForm({ name: "", description: "", sport: "Multi", emoji: "🏆", privacy: "private", type: "season", maxMembers: 12, prize: "" });
      setActiveTab("my");
      loadData();
    }
  }

  const allLeagues = [...myLeagues, ...publicLeagues];
  const viewing = viewLeague ? allLeagues.find((l) => l.id === viewLeague) : null;
  const isMyLeague = viewLeague ? myLeagues.some((l) => l.id === viewLeague) : false;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {viewing && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/90 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#0a1628] border border-[#152d52] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="h-24 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${viewing.color}22, ${viewing.color}44)` }}>
                <span className="text-5xl">{viewing.emoji}</span>
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
                  <div className="bg-[#060d18] rounded-xl p-3 text-center"><div className="text-white font-bold">{viewing.member_count}/{viewing.max_members}</div><div className="text-xs text-slate-500">Members</div></div>
                  <div className="bg-[#060d18] rounded-xl p-3 text-center"><div className="text-white font-bold capitalize">{viewing.format}</div><div className="text-xs text-slate-500">Format</div></div>
                  <div className="bg-[#060d18] rounded-xl p-3 text-center"><div className="text-white font-bold">{viewing.sport}</div><div className="text-xs text-slate-500">Sport</div></div>
                </div>
                <div className="bg-[#060d18] rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Prize</span><span className="text-amber-400">{viewing.prize}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Season</span><span className="text-white">{viewing.season}</span></div>
                </div>
                {isMyLeague && myRanks[viewing.id] && (
                  <div className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl p-3 mb-4 text-center">
                    <div className="text-[#38bdf8] font-bold text-lg">#{myRanks[viewing.id]}</div>
                    <div className="text-xs text-slate-400">Your Current Rank</div>
                  </div>
                )}
                {viewing.privacy === "private" && isMyLeague && (
                  <div className="bg-[#060d18] rounded-xl p-3 mb-4 flex items-center justify-between">
                    <div><div className="text-xs text-slate-500">Invite Code</div><div className="text-white font-mono font-bold">{viewing.invite_code}</div></div>
                    <button onClick={() => navigator.clipboard.writeText(viewing.invite_code)} className="text-xs text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-1.5 rounded-lg">Copy</button>
                  </div>
                )}
                <div className="flex gap-3">
                  {isMyLeague ? (
                    <button onClick={() => { handleLeave(viewing.id); setViewLeague(null); }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-[#152d52] text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all">
                      Leave League
                    </button>
                  ) : (
                    <button onClick={() => { handleJoin(viewing.id); setViewLeague(null); }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc] transition-all">
                      Join League
                    </button>
                  )}
                  <button onClick={() => setViewLeague(null)} className="px-4 py-2.5 border border-[#152d52] text-slate-400 rounded-xl text-sm hover:text-white">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. The Shark Tank"
                      className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="What's this league about?"
                      className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Emoji</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map((e) => (
                        <button key={e} onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                          className={`w-10 h-10 text-xl rounded-lg border transition-all ${form.emoji === e ? "border-[#38bdf8] bg-[#38bdf8]/10" : "border-[#152d52] hover:border-[#38bdf8]/40"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Sport</label>
                      <select value={form.sport} onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                        {["NBA", "NFL", "MLB", "NHL", "NCAAF", "Multi"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Format</label>
                      <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as LeagueForm["type"] }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none">
                        <option value="season">Season-long</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Max Members</label>
                      <input type="number" min={2} max={1000} value={form.maxMembers} onChange={(e) => setForm((p) => ({ ...p, maxMembers: parseInt(e.target.value) || 12 }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#38bdf8]/50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Prize (optional)</label>
                      <input value={form.prize} onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))} placeholder="e.g. $100 prize pool"
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["private", "public"] as const).map((p) => (
                        <button key={p} onClick={() => setForm((prev) => ({ ...prev, privacy: p }))}
                          className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${form.privacy === p ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"}`}>
                          {p === "public" ? "🌐 Public" : "🔒 Private"}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{form.privacy === "private" ? "Invite-only via code." : "Anyone can find and join."}</p>
                  </div>
                  <button onClick={handleCreate} disabled={!form.name.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${form.name.trim() ? "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]" : "bg-[#152d52] text-slate-500 cursor-not-allowed"}`}>
                    Create League
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🏆 Leagues</h1>
            <p className="text-slate-400 text-sm mt-1">Compete with friends and the world</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all">
            + Create
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["my", "discover"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab === "my" ? `My Leagues (${myLeagues.length})` : "Discover"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="card h-40 animate-pulse" />)}</div>
        ) : activeTab === "my" ? (
          myLeagues.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-white font-semibold mb-2">No leagues yet</div>
              <div className="text-slate-400 text-sm mb-4">Create a private league with friends or join a public one.</div>
              <button onClick={() => setActiveTab("discover")} className="text-[#38bdf8] text-sm hover:underline">Browse leagues →</button>
            </div>
          ) : (
            <div className="space-y-4">
              {myLeagues.map((league) => (
                <div key={league.id} className="card p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${league.color}22` }}>{league.emoji}</div>
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
                    {[
                      { value: `${league.member_count}/${league.max_members}`, label: "Members" },
                      { value: myRanks[league.id] ? `#${myRanks[league.id]}` : "—", label: "My Rank", color: "text-[#38bdf8]" },
                      { value: league.format, label: "Format" },
                      { value: league.sport, label: "Sport" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#060d18] rounded-lg p-2.5 text-center">
                        <div className={`font-bold text-sm capitalize ${s.color || "text-white"}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewLeague(league.id)} className="flex-1 py-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium rounded-lg hover:bg-[#38bdf8]/20 transition-all">
                      View Details
                    </button>
                    {league.privacy === "private" && (
                      <button onClick={() => navigator.clipboard.writeText(league.invite_code)} className="px-3 py-2 border border-[#152d52] text-slate-400 text-xs rounded-lg hover:text-white transition-colors">
                        📋 Copy Invite
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          publicLeagues.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <div className="text-slate-400">No public leagues available yet.</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {publicLeagues.map((league) => (
                <div key={league.id} className="card card-hover p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${league.color}22` }}>{league.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{league.name}</div>
                      <div className="text-xs text-slate-500">{league.member_count} / {league.max_members} members</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{league.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">{league.prize}</span>
                    <span className="text-xs text-slate-500 capitalize">{league.format}</span>
                  </div>
                  <button onClick={() => { handleJoin(league.id); setActiveTab("my"); }}
                    className="w-full py-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium rounded-lg hover:bg-[#38bdf8]/20 transition-all">
                    Join League
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
