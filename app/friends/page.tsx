"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  bio: string;
  wins: number;
  losses: number;
  streak: number;
  streak_type: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggested, setSuggested] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "find">("friends");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map((f) =>
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        );
        const { data: friendProfiles } = await supabase
          .from("profiles").select("*").in("id", friendIds);
        if (friendProfiles) setFriends(friendProfiles);
      }

      // Suggested: other users not already friends
      const { data: others } = await supabase
        .from("profiles").select("*").neq("id", user.id).limit(5);
      if (others) setSuggested(others);

      setLoading(false);
    }
    load();
  }, []);

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
      .neq("id", userId)
      .limit(10);
    if (data) setSearchResults(data);
    setSearching(false);
  }

  async function sendRequest(targetId: string) {
    if (!userId) return;
    await supabase.from("friendships").insert({
      requester_id: userId,
      addressee_id: targetId,
      status: "accepted",
    });
    setPendingRequests((prev) => ({ ...prev, [targetId]: true }));
  }

  const filteredFriends = friends.filter(
    (f) => f.display_name.toLowerCase().includes(search.toLowerCase()) ||
      f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">🤝 Friends</h1>
          <p className="text-slate-400 text-sm mt-1">Connect with other pickers</p>
        </div>

        <div className="flex gap-2 mb-5 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["friends", "find"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab === "friends" ? `My Friends (${friends.length})` : "Find People"}
            </button>
          ))}
        </div>

        {activeTab === "friends" && (
          <>
            {friends.length > 0 && (
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-[#0a1628] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600 mb-4" />
            )}

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
            ) : filteredFriends.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <div className="text-white font-semibold mb-2">No friends yet</div>
                <div className="text-slate-400 text-sm mb-4">Find people to follow and compete against.</div>
                <button onClick={() => setActiveTab("find")} className="text-[#38bdf8] text-sm hover:underline">Find people →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                      style={{ background: friend.avatar_color }}>
                      {friend.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{friend.display_name}</div>
                      <div className="text-xs text-slate-500">@{friend.username}</div>
                      {friend.bio && <div className="text-xs text-slate-400 mt-1 truncate">{friend.bio}</div>}
                      {friend.streak > 0 && (
                        <div className="text-xs text-orange-400 mt-1">{friend.streak}{friend.streak_type} streak 🔥</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "find" && (
          <>
            <div className="flex gap-2 mb-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username or name..."
                className="flex-1 bg-[#0a1628] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
              />
              <button onClick={handleSearch} disabled={searching}
                className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-4 rounded-xl hover:bg-[#7dd3fc] transition-all disabled:opacity-50">
                {searching ? "..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-3 mb-6">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Results</div>
                {searchResults.map((user) => (
                  <div key={user.id} className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                      style={{ background: user.avatar_color }}>
                      {user.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{user.display_name}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                    <button onClick={() => sendRequest(user.id)} disabled={!!pendingRequests[user.id]}
                      className={`text-xs font-medium px-4 py-2 rounded-xl border transition-all ${pendingRequests[user.id] ? "border-[#38bdf8]/30 text-[#38bdf8]" : "bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/20"}`}>
                      {pendingRequests[user.id] ? "Added ✓" : "+ Add"}
                    </button>
                  </div>
                ))}
              </div>
            ) : suggested.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">People on SpreadHeads</div>
                {suggested.map((user) => (
                  <div key={user.id} className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                      style={{ background: user.avatar_color }}>
                      {user.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{user.display_name}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                    <button onClick={() => sendRequest(user.id)} disabled={!!pendingRequests[user.id]}
                      className={`text-xs font-medium px-4 py-2 rounded-xl border transition-all ${pendingRequests[user.id] ? "border-[#38bdf8]/30 text-[#38bdf8]" : "bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/20"}`}>
                      {pendingRequests[user.id] ? "Added ✓" : "+ Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
