"use client";

import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060d18]">
      <Sidebar />
      <TopNav />
      <main className="lg:ml-60 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
