import AppShell from "../components/AppShell";
import { statsData, currentUser } from "../data/placeholder";

export default function StatsPage() {
  const { overall, bySport, byPickType, monthlyTrend } = statsData;
  const maxMonthWins = Math.max(...monthlyTrend.map((m) => m.wins + m.losses));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Your Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Season performance overview</p>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Win Rate", value: `${overall.winRate}%`, color: "text-[#38bdf8]", sub: `${overall.wins}W - ${overall.losses}L - ${overall.pushes}P` },
            { label: "Total Picks", value: overall.totalPicks, color: "text-white", sub: "All time" },
            { label: "ROI", value: overall.roi, color: "text-green-400", sub: "Return on investment" },
            { label: "Streak", value: `${overall.streak}W 🔥`, color: "text-orange-400", sub: `Best: ${overall.longestWinStreak}W` },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* By sport */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">By Sport</h3>
            <div className="space-y-3">
              {bySport.map((s) => {
                const pct = Math.round((s.wins / (s.wins + s.losses)) * 100);
                return (
                  <div key={s.sport}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.emoji}</span>
                        <span className="text-sm font-medium text-white">{s.sport}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#38bdf8]">{pct}%</span>
                        <span className="text-xs text-slate-500 ml-2">{s.wins}-{s.losses}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[#152d52] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#38bdf8] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By pick type */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">By Pick Type</h3>
            <div className="space-y-3">
              {byPickType.map((p) => (
                <div key={p.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{p.type}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[#38bdf8]">{p.winRate}%</span>
                      <span className="text-xs text-slate-500 ml-2">{p.wins}-{p.losses}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#152d52] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.winRate}%`,
                        background: p.winRate >= 60 ? "#22c55e" : p.winRate >= 55 ? "#38bdf8" : "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#152d52]">
              <h4 className="text-sm font-medium text-white mb-3">Advanced Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Avg Odds Bet</span>
                  <span className="text-xs text-white font-medium">{overall.avgOdds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Total Points</span>
                  <span className="text-xs text-white font-medium">{currentUser.points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Global Rank</span>
                  <span className="text-xs text-[#38bdf8] font-medium">#{currentUser.rank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Monthly Trend</h3>
          <div className="flex items-end gap-3 h-36">
            {monthlyTrend.map((m) => {
              const winH = Math.round((m.wins / maxMonthWins) * 100);
              const lossH = Math.round((m.losses / maxMonthWins) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "100px" }}>
                    <div className="w-full bg-red-500/40 rounded-sm" style={{ height: `${lossH}%` }} />
                    <div className="w-full bg-[#38bdf8]/70 rounded-sm" style={{ height: `${winH}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500">{m.month}</div>
                  <div className="text-[10px] text-slate-400">{m.wins}-{m.losses}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#38bdf8]/70" />
              <span className="text-xs text-slate-400">Wins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500/40" />
              <span className="text-xs text-slate-400">Losses</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">🏅 Earned Badges</h3>
          <div className="flex flex-wrap gap-3">
            {currentUser.badges.map((badge) => (
              <div key={badge} className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl px-4 py-2 text-sm text-[#38bdf8]">
                {badge}
              </div>
            ))}
            {["Perfect Week 🎯", "Underdog Hunter 🐶"].map((badge) => (
              <div key={badge} className="bg-[#152d52]/50 border border-[#152d52] rounded-xl px-4 py-2 text-sm text-slate-500 relative">
                <span className="opacity-40">{badge}</span>
                <span className="ml-2 text-[10px] text-slate-600">Locked</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
