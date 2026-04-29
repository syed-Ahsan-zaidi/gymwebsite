"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-black overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-64 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8 overflow-y-auto overflow-x-hidden flex-1">
          <div className="max-w-[1400px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
