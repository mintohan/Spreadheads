"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { todayGames } from "../data/placeholder";

type PickType = "spread" | "ml" | "total";
type PickChoice = { team?: string; direction?: "over" | "under" };

interface Pick {
  gameId: string;
  type: PickType;
  choice: PickChoice;
  label: string;
}

export default function PicksPage() {
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [pickType, setPickType] = useState<Record<string, PickType>>({});

  const unlockedGames = todayGames.filter((g) => !g.locked);
  const lockedGames = todayGames.filter((g) => g.locked);

  const allPickedCount = Object.keys(picks).length;
  const allSubmitted = submitted;

  function selectPick(gameId: string, type: PickType, choice: PickChoice, label: string) {
    setPicks((prev) => {
      const current = prev[gameId];
      if (current?.label === label && current?.type === type) {
        const next = { ...prev };
        delete next[gameId];
        return next;
      }
      return { ...prev, [gameId]: { gameId, type, choice, label } };
    });
  }

  function getPickTypeForGame(gameId: string): PickType {
    return pickType[gameId] || "spread";
  }

  function handleSubmit() {
    if (allPickedCount === 0) return;
    setSubmitted(true);
  }

  const historyPicks = [
    { game: "Lakers vs Warriors", pick: "LAL -2.5", result: "win", points: 10, date: "Jun 20", sport: "🏀" },
    { game: "Cowboys vs Eagles", pick: "PHI +3", result: "loss", points: 0, date: "Jun 19", sport: "🏈" },
    { game: "Yankees vs Astros", pick: "NYY ML", result: "win", points: 8, date: "Jun 18", sport: "⚾" },
    { game: "Celtics vs Bucks", pick: "BOS -5.5", result: "win", points: 10, date: "Jun 17", sport: "🏀" },
    { game: "Heat vs Knicks", pick: "Over 218.5", result: "loss", points: 0, date: "Jun 16", sport: "🏀" },
    { game: "Giants vs Cardinals", pick: "ARI +7", result: "push", points: 5, date: "Jun 15", sport: "🏈" },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🎯 Picks</h1>
            <p className="text-slate-400 text-sm mt-1">Make your picks before lock time</p>
          </div>
          {!allSubmitted && activeTab === "today" && (
            <div className="text-right">
              <div className="text-sm text-slate-400">{allPickedCount} / {unlockedGames.length} picked</div>
              <div className="text-xs text-slate-500 mt-0.5">Today&#39;s games</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["today", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "today" ? "Today's Picks" : "History"}
            </button>
          ))}
        </div>

        {activeTab === "today" && (
          <>
            {/* Submitted state */}
            {allSubmitted ? (
              <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#152d52] border border-[#38bdf8]/30 p-8 text-center mb-6">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-white mb-2">All picks submitted for today!</h2>
                <p className="text-slate-400 text-sm mb-4">Good luck! Check back after games complete for results.</p>
                <div className="flex flex-wrap justify-center gap-3 mb-5">
                  {Object.values(picks).map((p) => (
                    <div key={p.gameId} className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-lg px-3 py-1.5 text-sm text-[#38bdf8]">
                      {p.label}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setSubmitted(false); setPicks({}); }}
                  className="text-slate-400 text-sm hover:text-white transition-colors border border-[#152d52] px-4 py-2 rounded-lg"
                >
                  Edit Picks
                </button>
              </div>
            ) : (
              <>
                {/* Locked games */}
                {lockedGames.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">🔒 Locked</span>
                    </div>
                    <div className="space-y-3">
                      {lockedGames.map((game) => (
                        <div key={game.id} className="card p-4 opacity-60">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{game.logo}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{game.awayTeam} @ {game.homeTeam}</div>
                              <div className="text-xs text-slate-500">{game.sport} · {game.gameTime}</div>
                            </div>
                            <span className="text-xs text-red-400 border border-red-400/30 px-2 py-1 rounded-lg">Locked</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unlocked games */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">⚡ Open for picks</span>
                  </div>
                  {unlockedGames.map((game) => {
                    const currentType = getPickTypeForGame(game.id);
                    const picked = picks[game.id];

                    return (
                      <div key={game.id} className={`card p-4 transition-all ${picked ? "border-[#38bdf8]/30" : ""}`}>
                        {/* Game header */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{game.logo}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{game.awayTeam} @ {game.homeTeam}</div>
                            <div className="text-xs text-slate-500">{game.sport} · Locks {game.gameTime}</div>
                          </div>
                          {picked && (
                            <span className="text-xs bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-1 rounded-lg">✓ Picked</span>
                          )}
                        </div>

                        {/* Pick type toggle */}
                        <div className="flex gap-1 mb-4 bg-[#060d18] p-1 rounded-lg w-fit">
                          {(["spread", "ml", "total"] as PickType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setPickType((prev) => ({ ...prev, [game.id]: t }))}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                currentType === t ? "bg-[#152d52] text-white" : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {t === "spread" ? "Spread" : t === "ml" ? "Moneyline" : "Total"}
                            </button>
                          ))}
                        </div>

                        {/* Pick buttons */}
                        {currentType === "spread" && (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: `${game.awayTeam} ${game.spread.includes(game.homeTeam.substring(0, 3)) ? "+" : ""}`, odds: game.homeOdds, key: game.awayTeam + "_spread" },
                              { label: game.spread, odds: game.awayOdds, key: game.homeTeam + "_spread" },
                            ].map((opt, i) => {
                              const isSelected = picked?.label === (i === 0 ? `${game.awayTeam} ATS` : game.spread);
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => selectPick(game.id, "spread", { team: i === 0 ? game.awayTeam : game.homeTeam }, i === 0 ? `${game.awayTeam} ATS` : game.spread)}
                                  className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                    isSelected
                                      ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                      : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                  }`}
                                >
                                  <span className="font-semibold text-sm">{i === 0 ? `${game.awayTeam}` : game.homeTeam}</span>
                                  <span className={`text-xs mt-0.5 ${isSelected ? "text-[#38bdf8]" : "text-slate-400"}`}>{game.spread.includes(i === 0 ? game.awayTeam.substring(0,3) : game.homeTeam.substring(0,3)) ? game.spread : (i === 0 ? game.awayOdds : game.homeOdds)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentType === "ml" && (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { team: game.awayTeam, odds: game.awayOdds },
                              { team: game.homeTeam, odds: game.homeOdds },
                            ].map((opt) => {
                              const isSelected = picked?.label === `${opt.team} ML`;
                              return (
                                <button
                                  key={opt.team}
                                  onClick={() => selectPick(game.id, "ml", { team: opt.team }, `${opt.team} ML`)}
                                  className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                    isSelected
                                      ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                      : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                  }`}
                                >
                                  <span className="font-semibold text-sm">{opt.team}</span>
                                  <span className={`text-xs mt-0.5 ${isSelected ? "text-[#38bdf8]" : "text-slate-400"}`}>{opt.odds}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {currentType === "total" && (
                          <div className="grid grid-cols-2 gap-3">
                            {(["over", "under"] as const).map((dir) => {
                              const isSelected = picked?.label === `${dir === "over" ? "Over" : "Under"} ${game.total.split(" ")[1]}`;
                              const label = `${dir === "over" ? "Over" : "Under"} ${game.total.split(" ")[1]}`;
                              return (
                                <button
                                  key={dir}
                                  onClick={() => selectPick(game.id, "total", { direction: dir }, label)}
                                  className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                    isSelected
                                      ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                      : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                  }`}
                                >
                                  <span className="font-semibold text-sm capitalize">{dir}</span>
                                  <span className={`text-xs mt-0.5 ${isSelected ? "text-[#38bdf8]" : "text-slate-400"}`}>{game.total.split(" ")[1]} pts</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit button */}
                <div className="sticky bottom-20 lg:bottom-4">
                  <button
                    onClick={handleSubmit}
                    disabled={allPickedCount === 0}
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                      allPickedCount > 0
                        ? "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc] shadow-lg shadow-[#38bdf8]/20"
                        : "bg-[#152d52] text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {allPickedCount === 0
                      ? "Select picks to submit"
                      : allPickedCount === unlockedGames.length
                      ? `Submit All ${allPickedCount} Picks ✓`
                      : `Submit ${allPickedCount} Pick${allPickedCount !== 1 ? "s" : ""} (${unlockedGames.length - allPickedCount} remaining)`}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">47</div>
                <div className="text-xs text-slate-500 mt-1">Wins</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-red-400">31</div>
                <div className="text-xs text-slate-500 mt-1">Losses</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-[#38bdf8]">60.3%</div>
                <div className="text-xs text-slate-500 mt-1">Win Rate</div>
              </div>
            </div>
            {historyPicks.map((pick, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <span className="text-xl">{pick.sport}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  pick.result === "win" ? "bg-green-500/20 text-green-400" :
                  pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                  "bg-slate-500/20 text-slate-400"
                }`}>
                  {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{pick.game}</div>
                  <div className="text-xs text-slate-500">{pick.pick} · {pick.date}</div>
                </div>
                <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-400"}`}>
                  {pick.result === "win" ? `+${pick.points}` : pick.result === "push" ? "Push" : "−0"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
