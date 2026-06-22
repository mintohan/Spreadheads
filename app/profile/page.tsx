"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { currentUser, recentPicks, statsData } from "../data/placeholder";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentUser.bio);
  const [tempBio, setTempBio] = useState(currentUser.bio);
  const [activeTab, setActiveTab] = useState<"picks" | "badges" | "settings">("picks");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#060d18]"
                style={{ background: currentUser.avatarColor }}
              >
                {currentUser.avatar}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-[#38bdf8] rounded-full flex items-center justify-center text-[10px] text-[#060d18]">
                ✏️
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
                  <div className="text-slate-500 text-sm">@{currentUser.username}</div>
                  <div className="text-xs text-slate-600 mt-1">Member since {currentUser.joinDate}</div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs border border-[#152d52] text-slate-400 px-3 py-1.5 rounded-lg hover:text-white transition-colors flex-shrink-0"
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
              {editing ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={3}
                    className="w-full bg-[#060d18] border border-[#152d52] focus:border-[#38bdf8]/50 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none"
                  />
                  <button
                    onClick={() => { setBio(tempBio); setEditing(false); }}
                    className="text-xs bg-[#38bdf8] text-[#060d18] font-semibold px-4 py-1.5 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-sm mt-3">{bio}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#152d52]">
            {[
              { value: `${currentUser.winRate}%`, label: "Win Rate", color: "text-[#38bdf8]" },
              { value: `${currentUser.record.wins}-${currentUser.record.losses}`, label: "Record", color: "text-white" },
              { value: `#${currentUser.rank}`, label: "Global Rank", color: "text-amber-400" },
              { value: currentUser.points.toLocaleString(), label: "Points", color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["picks", "badges", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "picks" && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {statsData.bySport.map((s) => (
                <div key={s.sport} className="card p-3 text-center">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="text-sm font-bold text-white">{Math.round(s.wins / (s.wins + s.losses) * 100)}%</div>
                  <div className="text-xs text-slate-500">{s.sport} · {s.wins}-{s.losses}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Picks</h3>
              {recentPicks.map((pick) => (
                <div key={pick.id} className="card p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    pick.result === "win" ? "bg-green-500/20 text-green-400" :
                    pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{pick.game}</div>
                    <div className="text-xs text-slate-500">{pick.pick} · {pick.date}</div>
                  </div>
                  <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-400"}`}>
                    {pick.result === "win" ? `+${pick.points}` : pick.result === "push" ? "Push" : "−0"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Earned Badges</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {currentUser.badges.map((badge) => (
                <div key={badge} className="card p-4 flex items-center gap-3">
                  <div className="text-2xl">{badge.split(" ").pop()}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{badge.slice(0, -2).trim()}</div>
                    <div className="text-xs text-slate-500">Earned badge</div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Locked Badges</h3>
            <div className="grid sm:grid-cols-2 gap-3 opacity-50">
              {[
                { name: "Perfect Week", emoji: "🎯", hint: "Go 7-0 in a week" },
                { name: "Underdog Hunter", emoji: "🐶", hint: "Win 10 underdog picks" },
                { name: "Sharp Shooter", emoji: "🎳", hint: "Hit 70%+ win rate for a month" },
                { name: "Community Builder", emoji: "🏗️", hint: "Create a community with 100+ members" },
              ].map((b) => (
                <div key={b.name} className="card p-4 flex items-center gap-3">
                  <div className="text-2xl">{b.emoji}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            {[
              { label: "Email Notifications", description: "Get pick results and league updates via email", on: true },
              { label: "Friend Pick Alerts", description: "See when friends make picks", on: true },
              { label: "Community Digests", description: "Weekly community roundup", on: false },
              { label: "Marketing Emails", description: "SpreadHeads news and promotions", on: false },
            ].map((setting) => (
              <div key={setting.label} className="card p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{setting.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{setting.description}</div>
                </div>
                <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${setting.on ? "bg-[#38bdf8]" : "bg-[#152d52]"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.on ? "left-6" : "left-1"}`} />
                </div>
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <button className="w-full py-2.5 border border-[#152d52] text-slate-400 rounded-xl text-sm hover:text-white transition-colors">
                Change Password
              </button>
              <button className="w-full py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
