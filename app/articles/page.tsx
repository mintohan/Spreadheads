"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "../../lib/supabase/client";

const CATEGORIES = ["All", "NBA", "NFL", "MLB", "NHL", "Strategy"];

interface Article {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  author_name: string;
  category: string;
  image: string;
  tags: string[];
  read_time: string;
  like_count: number;
  comment_count: number;
  trending: boolean;
  published_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState("All");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: likesData } = await supabase.from("article_likes").select("article_id").eq("user_id", user.id);
        if (likesData) {
          const map: Record<string, boolean> = {};
          likesData.forEach((l) => { map[l.article_id] = true; });
          setLiked(map);
        }
      }
      const { data } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleLike(articleId: string) {
    if (!userId) return;
    if (liked[articleId]) {
      await supabase.from("article_likes").delete().eq("article_id", articleId).eq("user_id", userId);
      await supabase.from("articles").update({ like_count: (articles.find(a => a.id === articleId)?.like_count ?? 1) - 1 }).eq("id", articleId);
    } else {
      await supabase.from("article_likes").insert({ article_id: articleId, user_id: userId });
      await supabase.from("articles").update({ like_count: (articles.find(a => a.id === articleId)?.like_count ?? 0) + 1 }).eq("id", articleId);
    }
    setLiked((prev) => ({ ...prev, [articleId]: !prev[articleId] }));
    setArticles((prev) => prev.map((a) => a.id === articleId ? { ...a, like_count: a.like_count + (liked[articleId] ? -1 : 1) } : a));
  }

  const filtered = articles.filter((a) => filter === "All" || a.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);
  const viewing = reading ? articles.find((a) => a.id === reading) : null;

  if (loading) {
    return <AppShell><div className="max-w-4xl mx-auto px-4 py-6 space-y-4">{[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse" />)}</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {viewing && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/95 backdrop-blur overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <button onClick={() => setReading(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">← Back to Articles</button>
              <div className="text-6xl mb-6 text-center">{viewing.image}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2.5 py-1 rounded-full">{viewing.category}</span>
                <span className="text-xs text-slate-500">{viewing.read_time} read · {new Date(viewing.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">{viewing.title}</h1>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#152d52]">
                <div className="w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-xs font-bold text-[#060d18]">
                  {viewing.author_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-sm font-medium text-white">{viewing.author_name}</div>
              </div>
              <div className="text-slate-300 leading-relaxed mb-4">{viewing.excerpt}</div>
              <div className="text-slate-400 leading-relaxed">{viewing.body}</div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#152d52]">
                <button onClick={() => toggleLike(viewing.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${liked[viewing.id] ? "text-red-400" : "text-slate-400 hover:text-white"}`}>
                  {liked[viewing.id] ? "❤️" : "🤍"} {viewing.like_count}
                </button>
                <span className="text-slate-400 text-sm">💬 {viewing.comment_count}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">📰 Articles</h1>
          <p className="text-slate-400 text-sm mt-1">Analysis, strategy, and sports news</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === cat ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📰</div>
            <div className="text-slate-400">No articles yet. Check back soon.</div>
          </div>
        ) : (
          <>
            {featured && (
              <button onClick={() => setReading(featured.id)} className="w-full card card-hover p-6 mb-6 text-left block">
                <div className="flex items-start gap-5">
                  <div className="text-5xl flex-shrink-0">{featured.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded-full">{featured.category}</span>
                      {featured.trending && <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-400/20 px-2 py-0.5 rounded-full">🔥 Trending</span>}
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2 leading-snug">{featured.title}</h2>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{featured.author_name}</span>
                      <span>{featured.read_time}</span>
                      <span className="ml-auto">❤️ {featured.like_count}</span>
                    </div>
                  </div>
                </div>
              </button>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {rest.map((article) => (
                <button key={article.id} onClick={() => setReading(article.id)} className="card card-hover p-5 text-left block">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl flex-shrink-0">{article.image}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded-full">{article.category}</span>
                      <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mt-1">{article.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{article.author_name}</span>
                    <span className="ml-auto">{article.read_time}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(article.id); }}
                      className={`transition-colors ${liked[article.id] ? "text-red-400" : "hover:text-red-400"}`}>
                      {liked[article.id] ? "❤️" : "🤍"} {article.like_count}
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
