"use client";
import { useState, useEffect } from "react"; // 1. useEffect shamil kiya
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AIModal from "@/components/layout/AIModal";
import TodayPaymentsModal from "./TodayPaymentsModal";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CreditCard, 
  MessageSquare, 
  Award,
  Settings,
  CheckCircle2,
  LogOut,
  Building2,
  TrendingUp,
  Inbox,
  DollarSign 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTodayStatsOpen, setIsTodayStatsOpen] = useState(false);
  
  // 2. Aaj ki total collection ke liye state
  const [todayTotal, setTodayTotal] = useState(0);

  // 3. Data fetch karne ka function
  const fetchTodayStats = async () => {
    try {
      const response = await fetch("/api/stats/today");
      const data = await response.json();
      setTodayTotal(data.totalAmount || 0);
    } catch (error) {
      console.error("Error fetching sidebar stats:", error);
    }
  };

  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      fetchTodayStats();
      
      // Har 2 minute baad auto-refresh karega (optional)
      const interval = setInterval(fetchTodayStats, 120000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Onboarded Gyms", href: "/dashboard/gyms", icon: Building2, show: role === "SUPER_ADMIN" },
    { name: "Gym Payments", href: "/dashboard/payments", icon: CreditCard, show: role === "SUPER_ADMIN" },
    { name: "Progress", href: "/dashboard/progress", icon: TrendingUp, show: role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "TRAINER" },
    { name: "My Exercises", href: "/dashboard/exercises", icon: CheckCircle2, show: role !== "ADMIN" && role !== "SUPER_ADMIN" },
    { name: "Requests", href: "/dashboard/requests", icon: Inbox, show: role === "TRAINER" },
    { name: "Members", href: "/dashboard/members", icon: Users, show: role === "ADMIN" },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard, show: role === "ADMIN" },
    { name: "Trainers", href: "/dashboard/trainers", icon: Award, show: role === "ADMIN" },
    { name: "Gym Profile", href: "/dashboard/profile", icon: Dumbbell, show: role === "ADMIN" },
    { name: "AI Assistant", icon: MessageSquare, show: role !== "ADMIN" && role !== "SUPER_ADMIN", isAI: true },
  ];

  return (
    <>
      <aside className="w-64 min-w-[256px] flex-shrink-0 bg-slate-950 text-white h-screen fixed left-0 top-0 p-6 shadow-2xl border-r border-slate-800 font-sans flex flex-col z-50">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase italic">
            FlexManage<span className="text-blue-500">Pro</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            if (!item.show) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.isAI) {
              return (
                <button 
                  key={item.name}
                  onClick={() => setIsAIModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                >
                  <Icon size={20} className="text-slate-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                </button>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.href || "#"}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500"} />
                <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* NAYA SECTION: REAL-TIME COLLECTION DISPLAY */}
        {role === "SUPER_ADMIN" && (
          <div className="mb-4">
            <button 
              onClick={() => setIsTodayStatsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900/20 border border-blue-500/10 rounded-xl hover:border-green-500/40 transition-all group"
            >
              <div className="bg-green-500/20 p-2 rounded-lg group-hover:bg-green-500/30">
                <DollarSign size={18} className="text-green-500" />
              </div>
              <div className="text-left">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Today</p>
              <p className="text-sm font-bold text-white italic">
              {/* toLocaleString() se 6000 "6,000" ban jaye ga jo professional lagta hai */}
              PKR {todayTotal > 0 ? todayTotal.toLocaleString() : "0"}
             </p>
             </div>
            </button>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div className="pt-6 border-t border-slate-900 space-y-1">
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-4 py-3 transition rounded-xl hover:bg-slate-900 ${
              pathname === "/dashboard/settings" ? "text-white bg-slate-900" : "text-slate-500"
            }`}
          >
            <Settings size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Settings</span>
          </Link>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500/70 hover:text-red-500 transition rounded-xl hover:bg-red-500/5 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest italic">Logout</span>
          </button>
        </div>
      </aside>

      {/* MODALS */}
      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <TodayPaymentsModal 
        isOpen={isTodayStatsOpen} 
        onClose={() => {
          setIsTodayStatsOpen(false);
          fetchTodayStats(); // Modal band hone par value refresh karein
        }} 
      />
    </>
  );
}