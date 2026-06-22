"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

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

interface Member {
  user_id: string;
  profiles: {
    id: string;
    display_name: string;
    username: string;
    avatar_color: string;
    wins: number;
    losses: number;
    points: number;
  } | null;
}

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<"standings" | "members" | "info">("standings");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: leagueData }, { data: membersData }, { data: membership }] = await Promise.all([
        supabase.from("leagues").select("*").eq("id", id).single(),
        supabase.from("league_members").select("user_id, profiles(id, display_name, username, avatar_color, wins, losses, points)").eq("league_id", id),
        supabase.from("league_members").select("league_id").eq("league_id", id).eq("user_id", user.id).maybeSingle(),
      ]);

      if (!leagueData) { router.push("/leagues"); return; }
      setLeague(leagueData);
      if (membersData) setMembers(membersData as Member[]);
      setIsMember(!!membership);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleJoin() {
    if (!userId || !league) return;
    await supabase.from("league_members").insert({ league_id: league.id, user_id: userId });
    await supabase.from("leagues").update({ member_count: league.member_count + 1 }).eq("id", league.id);
    setIsMember(true);
    setLeague((l) => l ? { ...l, member_count: l.member_count + 1 } : l);
  }

  async function handleLeave() {
    if (!userId || !league) return;
    await supabase.from("league_members").delete().eq("league_id", league.id).eq("user_id", userId);
    setIsMember(false);
    router.push("/leagues");
  }

  function copyCode() {
    if (!league?.invite_code) return;
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sorted = [...members].sort((a, b) => {
    const ap = a.profiles?.points ?? 0;
    const bp = b.profiles?.points ?? 0;
    return bp - ap;
  });

  const myRank = sorted.findIndex((m) => m.user_id === userId) + 1;
  const isCommissioner = league?.commissioner_id === userId;

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <div className="card h-32 animate-pulse" />
          <div className="card h-64 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!league) return null;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <Link href="/leagues" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors w-fit">
          ← Leagues
        </Link>

        {/* Header */}
        <div className="rounded-2xl overflow-hidden border border-[#152d52]">
          <div className="h-24 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, #0d1e35, #152d52)` }}>
            <span className="text-5xl">{league.emoji}</span>
            <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full border ${league.privacy === "public" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-amber-400 border-amber-400/30 bg-amber-400/10"}`}>
              {league.privacy === "public" ? "🌐 Public" : "🔒 Private"}
            </span>
          </div>
          <div className="bg-[#0a1628] p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-white">{league.name}</h1>
              {isCommissioner && <span className="text-xs text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full flex-shrink-0">Commissioner</span>}
            </div>
            {league.description && <p className="text-slate-400 text-sm mb-4">{league.description}</p>}

            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { value: `${league.member_count}/${league.max_members}`, label: "Members" },
                { value: isMember && myRank ? `#${myRank}` : "—", label: "My Rank", color: "text-[#38bdf8]" },
                { value: league.format, label: "Format" },
                { value: league.prize || "—", label: "Prize", color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-[#060d18] rounded-xl p-2.5 text-center">
                  <div className={`font-bold text-sm capitalize truncate ${s.color || "text-white"}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {isMember ? (
                <>
                  {league.privacy === "private" && (
                    <button onClick={copyCode} className="flex items-center gap-2 bg-[#060d18] border border-[#152d52] text-slate-300 text-sm px-4 py-2 rounded-xl hover:border-[#38bdf8]/40 transition-all">
                      {copied ? "✓ Copied!" : "📋 Copy Invite Code"}
                    </button>
                  )}
                  {!isCommissioner && (
                    <button onClick={handleLeave} className="ml-auto text-sm text-red-400 border border-red-400/20 px-4 py-2 rounded-xl hover:bg-red-400/10 transition-all">
                      Leave
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleJoin} className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all">
                  Join League
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["standings", "members", "info"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Standings */}
        {activeTab === "standings" && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#152d52] flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Leaderboard</span>
              <span className="text-xs text-slate-500">{sorted.length} members</span>
            </div>
            {sorted.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No members yet.</div>
            ) : (
              <div className="divide-y divide-[#152d52]">
                {sorted.map((member, idx) => {
                  const p = member.profiles;
                  if (!p) return null;
                  const rank = idx + 1;
                  const isMe = member.user_id === userId;
                  const winRate = Math.round((p.wins / Math.max(p.wins + p.losses, 1)) * 100);
                  return (
                    <div key={member.user_id} className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-[#38bdf8]/5" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        rank === 1 ? "bg-amber-400/20 text-amber-400" :
                        rank === 2 ? "bg-slate-400/20 text-slate-300" :
                        rank === 3 ? "bg-orange-700/20 text-orange-500" :
                        "bg-[#152d52] text-slate-500"
                      }`}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18] flex-shrink-0"
                        style={{ background: p.avatar_color }}>
                        {p.display_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${isMe ? "text-[#38bdf8]" : "text-white"}`}>{p.display_name}</span>
                          {isMe && <span className="text-[10px] text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 rounded-full">You</span>}
                        </div>
                        <div className="text-xs text-slate-500">@{p.username}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-white">{p.points.toLocaleString()} pts</div>
                        <div className="text-xs text-slate-500">{p.wins}-{p.losses} · {winRate}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div className="space-y-2">
            {sorted.map((member, idx) => {
              const p = member.profiles;
              if (!p) return null;
              const isMe = member.user_id === userId;
              const isComm = member.user_id === league.commissioner_id;
              return (
                <div key={member.user_id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                    style={{ background: p.avatar_color }}>
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isMe ? "text-[#38bdf8]" : "text-white"}`}>{p.display_name}</span>
                      {isComm && <span className="text-[10px] text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded-full">Commissioner</span>}
                      {isMe && !isComm && <span className="text-[10px] text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 py-0.5 rounded-full">You</span>}
                    </div>
                    <div className="text-xs text-slate-500">@{p.username}</div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    #{idx + 1} · {p.points.toLocaleString()} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        {activeTab === "info" && (
          <div className="space-y-3">
            <div className="card p-5 space-y-3">
              {[
                { label: "Sport", value: league.sport },
                { label: "Format", value: league.format, capitalize: true },
                { label: "Privacy", value: league.privacy === "public" ? "🌐 Public" : "🔒 Private" },
                { label: "Max Members", value: `${league.max_members}` },
                { label: "Prize", value: league.prize || "Bragging rights" },
                ...(league.season ? [{ label: "Season", value: league.season }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={`text-white ${row.capitalize ? "capitalize" : ""}`}>{row.value}</span>
                </div>
              ))}
            </div>
            {isMember && league.privacy === "private" && (
              <div className="card p-5">
                <div className="text-xs text-slate-500 mb-2">Invite Code</div>
                <div className="flex items-center justify-between bg-[#060d18] rounded-xl px-4 py-3 border border-[#152d52]">
                  <span className="font-mono font-bold text-white tracking-widest">{league.invite_code}</span>
                  <button onClick={copyCode} className="text-xs text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-1.5 rounded-lg ml-3">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Share this code with friends to let them join.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
