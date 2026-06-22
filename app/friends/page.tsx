"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { friends, suggestedFriends } from "../data/placeholder";

const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  away: "#f59e0b",
  offline: "#6b7280",
};

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"friends" | "suggested" | "activity">("friends");
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const filtered = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.username.toLowerCase().includes(search.toLowerCase())
  );

  const activityFeed = [
    { id: 1, user: "Tyler Brooks", avatar: "TB", color: "#f59e0b", action: "picked", detail: "Lakers -2.5", time: "2m ago" },
    { id: 2, user: "Mia Santos", avatar: "MS", color: "#10b981", action: "picked", detail: "Chiefs ML", time: "8m ago" },
    { id: 3, user: "Tyler Brooks", avatar: "TB", color: "#f59e0b", action: "went on a", detail: "8-game win streak 🔥", time: "1h ago" },
    { id: 4, user: "Devon Clark", avatar: "DC", color: "#06b6d4", action: "joined", detail: "NBA Sharp Shooters community", time: "2h ago" },
    { id: 5, user: "Priya Nair", avatar: "PN", color: "#ef4444", action: "picked", detail: "Over 228.5 ✓ +10 pts", time: "3h ago" },
    { id: 6, user: "Carlos Mendez", avatar: "CM", color: "#8b5cf6", action: "created a", detail: "new parlay (5-leg)", time: "5h ago" },
    { id: 7, user: "Jake Williams", avatar: "JW", color: "#f97316", action: "picked", detail: "Dodgers ML ✓", time: "Yesterday" },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Challenge modal */}
        {challengeId && (() => {
          const friend = friends.find((f) => f.id === challengeId);
          if (!friend) return null;
          return (
            <div className="fixed inset-0 z-50 bg-[#060d18]/90 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-[#0a1628] border border-[#152d52] rounded-2xl w-full max-w-sm p-6 text-center">
                <div className="text-4xl mb-3">⚔️</div>
                <h2 className="text-xl font-bold text-white mb-1">Challenge {friend.name}?</h2>
                <p className="text-slate-400 text-sm mb-6">Head-to-head pick&#39;em matchup. Who picks better this week?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setChallengeId(null)}
                    className="flex-1 py-3 bg-[#38bdf8] text-[#060d18] font-semibold rounded-xl text-sm hover:bg-[#7dd3fc] transition-all"
                  >
                    Send Challenge 🦈
                  </button>
                  <button onClick={() => setChallengeId(null)} className="px-4 py-3 border border-[#152d52] text-slate-400 rounded-xl text-sm hover:text-white">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">🤝 Friends</h1>
          <p className="text-slate-400 text-sm mt-1">See what your crew is picking</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            className="w-full bg-[#0a1628] border border-[#152d52] rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["friends", "activity", "suggested"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "friends" ? `Friends (${friends.length})` : tab === "activity" ? "Activity" : "Suggested"}
            </button>
          ))}
        </div>

        {activeTab === "friends" && (
          <div className="space-y-3">
            {/* Online first */}
            {["online", "away", "offline"].map((status) => {
              const group = filtered.filter((f) => f.status === status);
              if (group.length === 0) return null;
              return (
                <div key={status}>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    {status === "online" ? "Online" : status === "away" ? "Away" : "Offline"}
                    <span className="text-slate-600">({group.length})</span>
                  </div>
                  {group.map((friend) => (
                    <div key={friend.id} className="card card-hover p-4 mb-3">
                      <div className="flex items-center gap-4">
                        {/* Avatar with status */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18]"
                            style={{ background: friend.avatarColor }}
                          >
                            {friend.avatar}
                          </div>
                          <span
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a1628]"
                            style={{ background: STATUS_COLORS[friend.status] }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{friend.name}</span>
                            {friend.streakType === "W" && friend.streak >= 3 && (
                              <span className="text-[10px] text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full">
                                {friend.streak}W 🔥
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">@{friend.username}</div>
                          <div className="text-xs text-slate-400 mt-1.5">{friend.bio}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">{friend.lastActive}</span>
                            <span className="text-xs text-slate-600">·</span>
                            <span className="text-xs text-slate-500">{friend.mutualCommunities} mutual communities</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => setChallengeId(friend.id)}
                            className="text-xs border border-[#38bdf8]/30 text-[#38bdf8] px-3 py-1.5 rounded-lg hover:bg-[#38bdf8]/10 transition-all"
                          >
                            ⚔️ Challenge
                          </button>
                          <button className="text-xs border border-[#152d52] text-slate-400 px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                            View Profile
                          </button>
                        </div>
                      </div>

                      {/* Recent pick */}
                      {friend.recentPick && (
                        <div className="mt-3 pt-3 border-t border-[#152d52] flex items-center gap-2">
                          <span className="text-xs text-slate-500">Latest pick:</span>
                          <span className="text-xs text-slate-300 font-medium">{friend.recentPick}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Feed</div>
            {activityFeed.map((item) => (
              <div key={item.id} className="card p-4 flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18] flex-shrink-0 mt-0.5"
                  style={{ background: item.color }}
                >
                  {item.avatar}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">{item.user}</span>
                  <span className="text-sm text-slate-400"> {item.action} </span>
                  <span className="text-sm text-[#38bdf8]">{item.detail}</span>
                  <div className="text-xs text-slate-500 mt-1">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "suggested" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">People you might know based on your communities and leagues.</p>
            {suggestedFriends.map((s) => (
              <div key={s.id} className="card p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                  style={{ background: s.avatarColor }}
                >
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{s.name}</div>
                  <div className="text-xs text-slate-500">@{s.username}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.mutualFriends} mutual friends</div>
                </div>
                <button
                  onClick={() => setAdded((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                  className={`text-xs font-medium px-4 py-2 rounded-xl border transition-all ${
                    added[s.id]
                      ? "border-[#38bdf8]/30 text-[#38bdf8]"
                      : "bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/20"
                  }`}
                >
                  {added[s.id] ? "Added ✓" : "+ Add"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
