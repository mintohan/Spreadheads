"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import { articles } from "../data/placeholder";

const CATEGORIES = ["All", "NBA", "NFL", "MLB", "NHL", "Strategy"];

export default function ArticlesPage() {
  const [filter, setFilter] = useState("All");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [reading, setReading] = useState<string | null>(null);

  const filtered = articles.filter((a) => filter === "All" || a.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const viewing = reading ? articles.find((a) => a.id === reading) : null;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Article reader modal */}
        {viewing && (
          <div className="fixed inset-0 z-50 bg-[#060d18]/95 backdrop-blur overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <button onClick={() => setReading(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                ← Back to Articles
              </button>
              <div className="text-6xl mb-6 text-center">{viewing.image}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2.5 py-1 rounded-full">{viewing.category}</span>
                <span className="text-xs text-slate-500">{viewing.readTime} read</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-500">{viewing.publishedAt}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">{viewing.title}</h1>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#152d52]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18]" style={{ background: viewing.authorColor }}>
                  {viewing.authorAvatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{viewing.author}</div>
                  <div className="text-xs text-slate-500">Staff Writer</div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed mb-4">{viewing.excerpt}</p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#152d52]">
                <button
                  onClick={() => setLiked((prev) => ({ ...prev, [viewing.id]: !prev[viewing.id] }))}
                  className={`flex items-center gap-2 text-sm transition-colors ${liked[viewing.id] ? "text-red-400" : "text-slate-400 hover:text-white"}`}
                >
                  {liked[viewing.id] ? "❤️" : "🤍"} {viewing.likes + (liked[viewing.id] ? 1 : 0)}
                </button>
                <span className="text-slate-400 text-sm">💬 {viewing.comments}</span>
                <div className="flex gap-1 ml-auto">
                  {viewing.tags.map((tag) => (
                    <span key={tag} className="text-xs text-slate-500 bg-[#0a1628] border border-[#152d52] px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">📰 Articles</h1>
          <p className="text-slate-400 text-sm mt-1">Analysis, strategy, and sports news</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === cat ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8]" : "border-[#152d52] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <button
            onClick={() => setReading(featured.id)}
            className="w-full card card-hover p-6 mb-6 text-left block"
          >
            <div className="flex items-start gap-5">
              <div className="text-5xl flex-shrink-0">{featured.image}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded-full">{featured.category}</span>
                  {featured.trending && <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-400/20 px-2 py-0.5 rounded-full">🔥 Trending</span>}
                </div>
                <h2 className="text-lg font-bold text-white mb-2 leading-snug">{featured.title}</h2>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{featured.excerpt}</p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#060d18]" style={{ background: featured.authorColor }}>
                    {featured.authorAvatar}
                  </div>
                  <span className="text-xs text-slate-400">{featured.author}</span>
                  <span className="text-xs text-slate-500">{featured.readTime}</span>
                  <span className="text-xs text-slate-500">{featured.publishedAt}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-slate-400">❤️ {featured.likes.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">💬 {featured.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {rest.map((article) => (
            <button
              key={article.id}
              onClick={() => setReading(article.id)}
              className="card card-hover p-5 text-left block"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl flex-shrink-0">{article.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded-full">{article.category}</span>
                    {article.trending && <span className="text-[10px] text-orange-400">🔥</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{article.title}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-[#060d18]" style={{ background: article.authorColor }}>
                  {article.authorAvatar}
                </div>
                <span className="text-xs text-slate-500">{article.author}</span>
                <span className="text-xs text-slate-500 ml-auto">{article.readTime}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setLiked((prev) => ({ ...prev, [article.id]: !prev[article.id] })); }}
                  className={`text-xs transition-colors ${liked[article.id] ? "text-red-400" : "text-slate-500 hover:text-red-400"}`}
                >
                  {liked[article.id] ? "❤️" : "🤍"} {article.likes + (liked[article.id] ? 1 : 0)}
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
