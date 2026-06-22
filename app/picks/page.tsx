"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

type PickType = "spread" | "ml" | "total";

interface Game {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  home_odds: string;
  away_odds: string;
  spread: string;
  total: string;
  game_time: string;
  locked: boolean;
  logo: string;
}

interface Pick {
  id: string;
  game_id: string;
  pick_type: PickType;
  pick_label: string;
  pick_choice: string;
  result: string;
  points_earned: number;
  created_at: string;
  games?: { home_team: string; away_team: string; sport: string };
}

export default function PicksPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [existingPicks, setExistingPicks] = useState<Record<string, Pick>>({});
  const [pendingPicks, setPendingPicks] = useState<Record<string, { type: PickType; label: string; choice: string }>>({});
  const [pickTypeTab, setPickTypeTab] = useState<Record<string, PickType>>({});
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [history, setHistory] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Load today's games
    const { data: gamesData } = await supabase
      .from("games")
      .select("*")
      .gte("game_time", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
      .lte("game_time", new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString())
      .order("game_time");

    if (gamesData) setGames(gamesData);

    if (user) {
      // Load user's picks for today's games
      const gameIds = gamesData?.map((g) => g.id) || [];
      if (gameIds.length > 0) {
        const { data: picksData } = await supabase
          .from("picks")
          .select("*")
          .eq("user_id", user.id)
          .in("game_id", gameIds);

        if (picksData) {
          const byGame: Record<string, Pick> = {};
          picksData.forEach((p) => { byGame[p.game_id] = p; });
          setExistingPicks(byGame);
          if (picksData.length > 0) setSubmitted(true);
        }
      }

      // Load pick history
      const { data: historyData } = await supabase
        .from("picks")
        .select("*, games(home_team, away_team, sport)")
        .eq("user_id", user.id)
        .not("result", "eq", "pending")
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyData) setHistory(historyData);
    }

    setLoading(false);
  }

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || Object.keys(pendingPicks).length === 0) return;

    setSubmitting(true);
    const inserts = Object.entries(pendingPicks).map(([gameId, pick]) => ({
      user_id: user.id,
      game_id: gameId,
      pick_type: pick.type,
      pick_label: pick.label,
      pick_choice: pick.choice,
      result: "pending",
    }));

    const { error } = await supabase.from("picks").upsert(inserts, { onConflict: "user_id,game_id" });

    if (!error) {
      setSubmitted(true);
      setPendingPicks({});
      loadData();
    }
    setSubmitting(false);
  }

  function selectPick(gameId: string, type: PickType, label: string, choice: string) {
    setPendingPicks((prev) => {
      const current = prev[gameId];
      if (current?.label === label) {
        const next = { ...prev };
        delete next[gameId];
        return next;
      }
      return { ...prev, [gameId]: { type, label, choice } };
    });
  }

  const unlockedGames = games.filter((g) => !g.locked);
  const lockedGames = games.filter((g) => g.locked);
  const allPickedCount = Object.keys(pendingPicks).length + Object.keys(existingPicks).length;

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🎯 Picks</h1>
            <p className="text-slate-400 text-sm mt-1">Make your picks before lock time</p>
          </div>
          {activeTab === "today" && !submitted && (
            <div className="text-right">
              <div className="text-sm text-slate-400">{allPickedCount} / {unlockedGames.length} picked</div>
              <div className="text-xs text-slate-500 mt-0.5">Today&apos;s games</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["today", "history"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab === "today" ? "Today's Picks" : "History"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-24 animate-pulse bg-[#0a1628]" />)}
          </div>
        ) : activeTab === "today" ? (
          <>
            {submitted && Object.keys(pendingPicks).length === 0 ? (
              <div className="rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#152d52] border border-[#38bdf8]/30 p-8 text-center mb-6">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-white mb-2">All picks submitted for today!</h2>
                <p className="text-slate-400 text-sm mb-4">Good luck! Results will update after games complete.</p>
                <div className="flex flex-wrap justify-center gap-3 mb-5">
                  {Object.values(existingPicks).map((p) => (
                    <div key={p.id} className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-lg px-3 py-1.5 text-sm text-[#38bdf8]">
                      {p.pick_label}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setSubmitted(false); setExistingPicks({}); }}
                  className="text-slate-400 text-sm hover:text-white border border-[#152d52] px-4 py-2 rounded-lg"
                >
                  Edit Picks
                </button>
              </div>
            ) : (
              <>
                {lockedGames.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">🔒 Locked</div>
                    <div className="space-y-3">
                      {lockedGames.map((game) => (
                        <div key={game.id} className="card p-4 opacity-60">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{game.logo}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{game.away_team} @ {game.home_team}</div>
                              <div className="text-xs text-slate-500">{game.sport} · {formatTime(game.game_time)}</div>
                            </div>
                            <span className="text-xs text-red-400 border border-red-400/30 px-2 py-1 rounded-lg">Locked</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">⚡ Open for picks</div>
                  {unlockedGames.map((game) => {
                    const currentType = pickTypeTab[game.id] || "spread";
                    const pending = pendingPicks[game.id];
                    const existing = existingPicks[game.id];
                    const isPicked = !!pending || !!existing;
                    const pickedLabel = pending?.label || existing?.pick_label;

                    return (
                      <div key={game.id} className={`card p-4 transition-all ${isPicked ? "border-[#38bdf8]/30" : ""}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{game.logo}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{game.away_team} @ {game.home_team}</div>
                            <div className="text-xs text-slate-500">{game.sport} · Locks {formatTime(game.game_time)}</div>
                          </div>
                          {isPicked && (
                            <span className="text-xs bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 px-2 py-1 rounded-lg">✓ {existing ? "Saved" : "Picked"}</span>
                          )}
                        </div>

                        {!existing && (
                          <>
                            <div className="flex gap-1 mb-4 bg-[#060d18] p-1 rounded-lg w-fit">
                              {(["spread", "ml", "total"] as PickType[]).map((t) => (
                                <button key={t}
                                  onClick={() => setPickTypeTab((prev) => ({ ...prev, [game.id]: t }))}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${currentType === t ? "bg-[#152d52] text-white" : "text-slate-500 hover:text-slate-300"}`}>
                                  {t === "spread" ? "Spread" : t === "ml" ? "Moneyline" : "Total"}
                                </button>
                              ))}
                            </div>

                            {currentType === "spread" && (
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: `${game.away_team} ATS`, sub: game.spread, choice: game.away_team },
                                  { label: `${game.home_team} ATS`, sub: game.spread, choice: game.home_team },
                                ].map((opt) => (
                                  <button key={opt.choice}
                                    onClick={() => selectPick(game.id, "spread", opt.label, opt.choice)}
                                    className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                      pickedLabel === opt.label
                                        ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                        : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                    }`}>
                                    <span className="font-semibold text-sm">{opt.choice}</span>
                                    <span className={`text-xs mt-0.5 ${pickedLabel === opt.label ? "text-[#38bdf8]" : "text-slate-400"}`}>{game.spread}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {currentType === "ml" && (
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { team: game.away_team, odds: game.away_odds },
                                  { team: game.home_team, odds: game.home_odds },
                                ].map((opt) => (
                                  <button key={opt.team}
                                    onClick={() => selectPick(game.id, "ml", `${opt.team} ML`, opt.team)}
                                    className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                      pickedLabel === `${opt.team} ML`
                                        ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                        : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                    }`}>
                                    <span className="font-semibold text-sm">{opt.team}</span>
                                    <span className={`text-xs mt-0.5 ${pickedLabel === `${opt.team} ML` ? "text-[#38bdf8]" : "text-slate-400"}`}>{opt.odds}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {currentType === "total" && (
                              <div className="grid grid-cols-2 gap-3">
                                {(["Over", "Under"] as const).map((dir) => {
                                  const label = `${dir} ${game.total.split(" ")[1]}`;
                                  return (
                                    <button key={dir}
                                      onClick={() => selectPick(game.id, "total", label, dir.toLowerCase())}
                                      className={`flex flex-col items-center py-3 px-4 rounded-xl border transition-all ${
                                        pickedLabel === label
                                          ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]"
                                          : "bg-[#060d18] border-[#152d52] text-white hover:border-[#38bdf8]/40"
                                      }`}>
                                      <span className="font-semibold text-sm">{dir}</span>
                                      <span className={`text-xs mt-0.5 ${pickedLabel === label ? "text-[#38bdf8]" : "text-slate-400"}`}>{game.total.split(" ")[1]}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}

                        {existing && (
                          <div className="bg-[#38bdf8]/5 border border-[#38bdf8]/15 rounded-xl p-3 text-sm text-slate-300">
                            Your pick: <span className="text-[#38bdf8] font-semibold">{existing.pick_label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {Object.keys(pendingPicks).length > 0 && (
                  <div className="sticky bottom-20 lg:bottom-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 rounded-xl font-semibold text-base bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc] shadow-lg shadow-[#38bdf8]/20 transition-all disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : `Submit ${Object.keys(pendingPicks).length} Pick${Object.keys(pendingPicks).length !== 1 ? "s" : ""} ✓`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No pick history yet. Make some picks!</div>
            ) : (
              history.map((pick) => (
                <div key={pick.id} className="card p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    pick.result === "win" ? "bg-green-500/20 text-green-400" :
                    pick.result === "loss" ? "bg-red-500/20 text-red-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {pick.result === "win" ? "W" : pick.result === "loss" ? "L" : "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{pick.games?.away_team} @ {pick.games?.home_team}</div>
                    <div className="text-xs text-slate-500">{pick.pick_label} · {new Date(pick.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm font-semibold ${pick.result === "win" ? "text-green-400" : pick.result === "loss" ? "text-red-400" : "text-slate-400"}`}>
                    {pick.result === "win" ? `+${pick.points_earned}` : pick.result === "push" ? "Push" : "−0"}
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
