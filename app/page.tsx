import AppShell from "./components/AppShell";
import { currentUser, leaderboard, recentPicks, todayGames, notifications } from "./data/placeholder";
import Link from "next/link";

export default function HomePage() {
  const upcomingGames = todayGames.filter((g) => !g.locked).slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0d1e35] to-[#152d52] border border-[#152d52] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[120px] leading-none opacity-10 select-none pointer-events-none">🦈</div>
          <div className="relative">
            <p className="text-slate-400 text-sm mb-1">Good evening,</p>
            <h1 className="text-2xl font-bold text-white mb-4">{currentUser.name} 👋</h1>
            <div className="flex flex-wrap gap-3">
              {[
                { value: `${currentUser.winRate}%`, label: "Win Rate", color: "text-[#38bdf8]" },
                { value: `${currentUser.record.wins}-${currentUser.record.losses}`, label: "Record", color: "text-white" },
                { value: `${currentUser.streak}W 🔥`, label: "Streak", color: "text-green-400" },
                { value: `#${currentUser.rank}`, label: "Global Rank", color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#060d18]/60 rounded-xl px-4 py-2.5 border border-[#152d52]">
                  <div className={`font-bold text-xl ${stat.color}`}>{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unread notifications */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <div className="space-y-2">
            {notifications.filter((n) => !n.read).map((n) => (
              <div key={n.id} className="flex items-center gap-3 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl px-4 py-3">
                <span className="text-lg">{n.type === "pick_result" ? "✅" : n.type === "friend_pick" ? "🤝" : "🏆"}</span>
                <div className="flex-1 text-sm text-white">{n.message}</div>
                <div className="text-xs text-slate-500">{n.time}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's games */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-lg">Today&#39;s Games</h2>
                <Link href="/picks" className="text-[#38bdf8] text-sm hover:underline">Make Picks →</Link>
              </div>
              <div className="space-y-3">
                {upcomingGames.map((game) => (
                  <div key={game.id} className="card card-hover p-4 flex items-center gap-4">
                    <div className="text-2xl">{game.logo}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{game.awayTeam} @ {game.homeTeam}</div>
                      <div className="text-xs text-slate-500">{game.sport} · {game.gameTime}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Spread</div>
                      <div className="text-sm font-semibold text-[#38bdf8]">{game.spread}</div>
                    </div>
                    <Link href="/picks" className="bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
                      Pick
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent results */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-lg">Recent Results</h2>
                <Link href="/stats" className="text-[#38bdf8] text-sm hover:underline">All Stats →</Link>
              </div>
              <div className="space-y-2">
                {recentPicks.slice(0, 4).map((pick) => (
                  <div key={pick.id} className="card p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
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
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">🏆 Leaderboard</h3>
                <Link href="/leagues" className="text-[#38bdf8] text-xs hover:underline">See all</Link>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.rank} className={`flex items-center gap-2 p-2 rounded-lg ${entry.isCurrentUser ? "bg-[#38bdf8]/10 border border-[#38bdf8]/20" : ""}`}>
                    <span className="text-xs font-bold w-6 text-center">
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : <span className="text-slate-500">#{entry.rank}</span>}
                    </span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#060d18] flex-shrink-0" style={{ background: entry.avatarColor }}>
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${entry.isCurrentUser ? "text-[#38bdf8]" : "text-white"}`}>{entry.name}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-300">{entry.points.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-white mb-3">🏅 Your Badges</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.badges.map((badge) => (
                  <span key={badge} className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-xs px-2.5 py-1 rounded-full">{badge}</span>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-white mb-3">⚡ Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "Make Today's Picks", href: "/picks", icon: "🎯" },
                  { label: "My Communities", href: "/communities", icon: "👥" },
                  { label: "League Standings", href: "/leagues", icon: "🏆" },
                  { label: "Read Articles", href: "/articles", icon: "📰" },
                ].map((action) => (
                  <Link key={action.href} href={action.href} className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#38bdf8] transition-colors p-2 rounded-lg hover:bg-[#38bdf8]/5">
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
