"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { communities } from "../data/placeholder";

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL", "NCAAF", "Multi"];

interface CommunityForm {
  name: string;
  description: string;
  sport: string;
  emoji: string;
  privacy: "public" | "private";
  category: "sport" | "strategy";
}

const EMOJIS = ["🏀", "🏈", "⚾", "🏒", "🎓", "🎰", "🦈", "🔥", "💯", "⚡", "🐶", "🏆"];

export default function CommunitiesPage() {
  const [joined, setJoined] = useState<Record<string, boolean>>(
    Object.fromEntries(communities.map((c) => [c.id, c.joined]))
  );
  const [filter, setFilter] = useState("All");
  const [categoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "mine">("discover");
  const [form, setForm] = useState<CommunityForm>({
    name: "",
    description: "",
    sport: "Multi",
    emoji: "🏆",
    privacy: "public",
    category: "sport",
  });
  const [created, setCreated] = useState<typeof communities>([]);
  const [viewCommunity, setViewCommunity] = useState<string | null>(null);

  const allCommunities = [...communities, ...created];

  const filtered = allCommunities.filter((c) => {
    const matchSport = filter === "All" || c.sport === filter;
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchSport && matchCat && matchSearch;
  });

  const myCommunities = allCommunities.filter((c) => joined[c.id]);

  function handleJoin(id: string) {
    setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleCreate() {
    if (!form.name.trim()) return;
    const newCommunity = {
      id: `c_${Date.now()}`,
      name: form.name,
      description: form.description || "A new community on SpreadHeads.",
      members: 1,
      sport: form.sport,
      emoji: form.emoji,
      color: "#38bdf8",
      posts: 0,
      joined: true,
      trending: false,
      category: form.category,
      privacy: form.privacy,
      recentActivity: "Just created",
    };
    setCreated((prev) => [...prev, newCommunity]);
    setJoined((prev) => ({ ...prev, [newCommunity.id]: true }));
    setShowCreate(false);
    setForm({ name: "", description: "", sport: "Multi", emoji: "🏆", privacy: "public", category: "sport" });
    setActiveTab("mine");
  }

  const viewing = viewCommunity ? allCommunities.find((c) => c.id === viewCommunity) : null;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* View community detail */}
        {viewing && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/90 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#0a1628] border border-[#152d52] rounded-2xl w-full max-w-lg overflow-hidden">
              <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${viewing.color}22, ${viewing.color}44)` }}>
                <div className="absolute inset-0 flex items-center justify-center text-5xl">{viewing.emoji}</div>
                <button onClick={() => setViewCommunity(null)} className="absolute top-3 right-3 text-white/70 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">{viewing.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full border ${viewing.privacy === "public" ? "text-green-400 border-green-400/30" : "text-amber-400 border-amber-400/30"}`}>
                    {viewing.privacy === "public" ? "🌐 Public" : "🔒 Private"}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{viewing.description}</p>
                <div className="flex gap-4 mb-5">
                  <div className="text-center">
                    <div className="text-white font-bold">{viewing.members.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{viewing.posts.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{viewing.sport}</div>
                    <div className="text-xs text-slate-500">Sport</div>
                  </div>
                </div>
                <div className="bg-[#060d18] rounded-xl p-3 mb-5">
                  <div className="text-xs text-slate-500 mb-1">Recent Activity</div>
                  <div className="text-sm text-slate-300">{viewing.recentActivity}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { handleJoin(viewing.id); setViewCommunity(null); }}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      joined[viewing.id]
                        ? "bg-[#152d52] text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]"
                    }`}
                  >
                    {joined[viewing.id] ? "Leave Community" : "Join Community"}
                  </button>
                  <button onClick={() => setViewCommunity(null)} className="px-4 py-2.5 border border-[#152d52] text-slate-400 rounded-xl text-sm hover:text-white">
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
                  <h2 className="text-xl font-bold text-white">Create Community</h2>
                  <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Community Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. NBA Sharp Shooters"
                      className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="What's this community about?"
                      rows={3}
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
                      <select
                        value={form.sport}
                        onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      >
                        {["NBA", "NFL", "MLB", "NHL", "NCAAF", "Multi"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as "sport" | "strategy" }))}
                        className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                      >
                        <option value="sport">Sport</option>
                        <option value="strategy">Strategy</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["public", "private"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setForm((prev) => ({ ...prev, privacy: p }))}
                          className={`py-2.5 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                            form.privacy === p ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"
                          }`}
                        >
                          {p === "public" ? "🌐 Public" : "🔒 Private"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!form.name.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 ${
                      form.name.trim() ? "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]" : "bg-[#152d52] text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Create Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">👥 Communities</h1>
            <p className="text-slate-400 text-sm mt-1">Join pick&#39;em communities and compete together</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all"
          >
            + Create
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["discover", "mine"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "discover" ? "Discover" : `My Communities (${myCommunities.length})`}
            </button>
          ))}
        </div>

        {activeTab === "discover" && (
          <>
            {/* Search + filters */}
            <div className="mb-5 space-y-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search communities..."
                className="w-full bg-[#0a1628] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
              />
              <div className="flex gap-2 flex-wrap">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filter === s ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            {allCommunities.filter((c) => c.trending).length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">🔥 Trending</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allCommunities.filter((c) => c.trending).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setViewCommunity(c.id)}
                      className="flex-shrink-0 card card-hover p-4 w-48 text-left"
                    >
                      <div className="text-3xl mb-2">{c.emoji}</div>
                      <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{c.members.toLocaleString()} members</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Community grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <div key={c.id} className="card card-hover p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${c.color}22` }}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => setViewCommunity(c.id)} className="text-sm font-semibold text-white hover:text-[#38bdf8] transition-colors text-left truncate">
                          {c.name}
                        </button>
                        {c.trending && <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-400/20 px-1.5 py-0.5 rounded-full flex-shrink-0">HOT</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.members.toLocaleString()} members · {c.sport}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 truncate pr-2">{c.recentActivity}</div>
                    <button
                      onClick={() => handleJoin(c.id)}
                      className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        joined[c.id]
                          ? "border-[#38bdf8]/30 text-[#38bdf8] hover:border-red-400/30 hover:text-red-400"
                          : "bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/20"
                      }`}
                    >
                      {joined[c.id] ? "Joined ✓" : "Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "mine" && (
          <div className="space-y-4">
            {myCommunities.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">👥</div>
                <div className="text-slate-400">You haven&#39;t joined any communities yet.</div>
                <button onClick={() => setActiveTab("discover")} className="mt-4 text-[#38bdf8] text-sm hover:underline">Browse communities →</button>
              </div>
            ) : (
              myCommunities.map((c) => (
                <div key={c.id} className="card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${c.color}22` }}>
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.members.toLocaleString()} members · {c.posts} posts</div>
                    <div className="text-xs text-slate-400 mt-1">{c.recentActivity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewCommunity(c.id)} className="text-xs border border-[#152d52] text-slate-400 px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                      View
                    </button>
                    <button onClick={() => handleJoin(c.id)} className="text-xs border border-red-400/30 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                      Leave
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
