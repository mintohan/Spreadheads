"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import Link from "next/link";
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check username available
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existing) {
      setError("Username already taken.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName || username,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#060d18] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
          <p className="text-slate-400 text-sm mb-6">We sent a confirmation link to <span className="text-white">{email}</span></p>
          <Link href="/auth/login" className="text-[#38bdf8] hover:underline text-sm">
            Back to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🦈</div>
          <h1 className="text-2xl font-bold text-white">Join SpreadHeads</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account and start picking</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Username *</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                  required
                  placeholder="sharktank99"
                  className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Shark Tank"
                  className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full bg-[#060d18] border border-[#152d52] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#38bdf8]/50 placeholder-slate-600"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#38bdf8] text-[#060d18] font-semibold rounded-xl hover:bg-[#7dd3fc] transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account 🦈"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#38bdf8] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
