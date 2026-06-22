"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

interface Community {
  id: string;
  name: string;
  description: string;
  sport: string;
  emoji: string;
  color: string;
  privacy: string;
  member_count: number;
  post_count: number;
  creator_id: string;
}

interface Post {
  id: string;
  body: string;
  like_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_color: string;
  } | null;
}

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "members">("feed");
  const [members, setMembers] = useState<{ user_id: string; profiles: { display_name: string; username: string; avatar_color: string; wins: number; losses: number } | null }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [
        { data: communityData },
        { data: postsData },
        { data: membership },
        { data: likesData },
        { data: membersData },
      ] = await Promise.all([
        supabase.from("communities").select("*").eq("id", id).single(),
        supabase.from("community_posts")
          .select("*, profiles(display_name, username, avatar_color)")
          .eq("community_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("community_members").select("community_id").eq("community_id", id).eq("user_id", user.id).maybeSingle(),
        supabase.from("community_post_likes").select("post_id").eq("user_id", user.id),
        supabase.from("community_members").select("user_id, profiles(display_name, username, avatar_color, wins, losses)").eq("community_id", id),
      ]);

      if (!communityData) { router.push("/communities"); return; }
      setCommunity(communityData);
      if (postsData) setPosts(postsData as Post[]);
      setIsMember(!!membership);
      if (likesData) {
        const map: Record<string, boolean> = {};
        likesData.forEach((l) => { map[l.post_id] = true; });
        setLikedPosts(map);
      }
      if (membersData) setMembers(membersData as typeof members);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleJoin() {
    if (!userId || !community) return;
    await supabase.from("community_members").insert({ community_id: community.id, user_id: userId });
    await supabase.from("communities").update({ member_count: community.member_count + 1 }).eq("id", community.id);
    setIsMember(true);
    setCommunity((c) => c ? { ...c, member_count: c.member_count + 1 } : c);
  }

  async function handleLeave() {
    if (!userId || !community) return;
    await supabase.from("community_members").delete().eq("community_id", community.id).eq("user_id", userId);
    setIsMember(false);
    router.push("/communities");
  }

  async function submitPost() {
    if (!newPost.trim() || !userId || !community || posting) return;
    setPosting(true);
    const { data } = await supabase.from("community_posts")
      .insert({ community_id: community.id, user_id: userId, body: newPost.trim() })
      .select("*, profiles(display_name, username, avatar_color)")
      .single();

    if (data) {
      setPosts((prev) => [data as Post, ...prev]);
      await supabase.from("communities").update({ post_count: (community.post_count || 0) + 1 }).eq("id", community.id);
      setCommunity((c) => c ? { ...c, post_count: (c.post_count || 0) + 1 } : c);
    }
    setNewPost("");
    setPosting(false);
  }

  async function toggleLike(postId: string) {
    if (!userId) return;
    const isLiked = likedPosts[postId];
    if (isLiked) {
      await supabase.from("community_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
      await supabase.from("community_posts").update({ like_count: Math.max((posts.find(p => p.id === postId)?.like_count ?? 1) - 1, 0) }).eq("id", postId);
    } else {
      await supabase.from("community_post_likes").insert({ post_id: postId, user_id: userId });
      await supabase.from("community_posts").update({ like_count: (posts.find(p => p.id === postId)?.like_count ?? 0) + 1 }).eq("id", postId);
    }
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: p.like_count + (isLiked ? -1 : 1) } : p));
  }

  async function deletePost(postId: string) {
    await supabase.from("community_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <div className="card h-32 animate-pulse" />
          <div className="card h-48 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!community) return null;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <Link href="/communities" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors w-fit">
          ← Communities
        </Link>

        {/* Header */}
        <div className="rounded-2xl overflow-hidden border border-[#152d52]">
          <div className="h-20 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d1e35, #152d52)" }}>
            <span className="text-4xl">{community.emoji}</span>
          </div>
          <div className="bg-[#0a1628] p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{community.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${community.privacy === "public" ? "text-green-400 border-green-400/30" : "text-amber-400 border-amber-400/30"}`}>
                {community.privacy === "public" ? "🌐 Public" : "🔒 Private"}
              </span>
            </div>
            {community.description && <p className="text-slate-400 text-sm mb-3">{community.description}</p>}
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span>👥 {community.member_count.toLocaleString()} members</span>
              <span>💬 {community.post_count || posts.length} posts</span>
              <span>🏅 {community.sport}</span>
            </div>
            {isMember ? (
              <button onClick={handleLeave} className="text-sm text-red-400 border border-red-400/20 px-4 py-2 rounded-xl hover:bg-red-400/10 transition-all">
                Leave Community
              </button>
            ) : (
              <button onClick={handleJoin} className="bg-[#38bdf8] text-[#060d18] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#7dd3fc] transition-all">
                Join Community
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#0a1628] p-1 rounded-xl w-fit">
          {(["feed", "members"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-[#38bdf8] text-[#060d18]" : "text-slate-400 hover:text-white"}`}>
              {tab === "feed" ? `Feed (${posts.length})` : `Members (${members.length})`}
            </button>
          ))}
        </div>

        {activeTab === "feed" && (
          <>
            {/* Compose */}
            {isMember ? (
              <div className="card p-4">
                <textarea
                  ref={textareaRef}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitPost(); }}
                  placeholder="What's your take? Talk picks, call out bad beats, talk trash..."
                  rows={3}
                  className="w-full bg-[#060d18] border border-[#152d52] focus:border-[#38bdf8]/40 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-slate-600 mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">⌘↵ to post</span>
                  <button onClick={submitPost} disabled={!newPost.trim() || posting}
                    className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${newPost.trim() ? "bg-[#38bdf8] text-[#060d18] hover:bg-[#7dd3fc]" : "bg-[#152d52] text-slate-500 cursor-not-allowed"}`}>
                    {posting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-4 text-center text-slate-400 text-sm">
                <button onClick={handleJoin} className="text-[#38bdf8] hover:underline">Join this community</button> to post.
              </div>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-white font-semibold mb-1">No posts yet</div>
                <div className="text-slate-400 text-sm">Be the first to post something.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const p = post.profiles;
                  const isOwn = post.user_id === userId;
                  return (
                    <div key={post.id} className="card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#060d18] flex-shrink-0"
                          style={{ background: p?.avatar_color || "#38bdf8" }}>
                          {(p?.display_name || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{p?.display_name}</span>
                              <span className="text-xs text-slate-500">@{p?.username}</span>
                              <span className="text-xs text-slate-600">·</span>
                              <span className="text-xs text-slate-600">{timeAgo(post.created_at)}</span>
                            </div>
                            {isOwn && (
                              <button onClick={() => deletePost(post.id)} className="text-slate-600 hover:text-red-400 text-xs transition-colors flex-shrink-0">✕</button>
                            )}
                          </div>
                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <button onClick={() => toggleLike(post.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${likedPosts[post.id] ? "text-red-400" : "text-slate-500 hover:text-white"}`}>
                              {likedPosts[post.id] ? "❤️" : "🤍"} {post.like_count > 0 ? post.like_count : ""}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "members" && (
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="card p-10 text-center text-slate-400 text-sm">No members yet.</div>
            ) : members.map((m) => {
              const p = m.profiles;
              if (!p) return null;
              const isMe = m.user_id === userId;
              const winRate = Math.round((p.wins / Math.max(p.wins + p.losses, 1)) * 100);
              return (
                <div key={m.user_id} className={`card p-4 flex items-center gap-3 ${isMe ? "border-[#38bdf8]/20" : ""}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#060d18] flex-shrink-0"
                    style={{ background: p.avatar_color }}>
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isMe ? "text-[#38bdf8]" : "text-white"}`}>{p.display_name}</span>
                      {isMe && <span className="text-[10px] text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 py-0.5 rounded-full">You</span>}
                      {m.user_id === community.creator_id && <span className="text-[10px] text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded-full">Creator</span>}
                    </div>
                    <div className="text-xs text-slate-500">@{p.username}</div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {p.wins}-{p.losses} · {winRate}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
