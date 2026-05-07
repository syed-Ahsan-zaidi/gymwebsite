"use client";
import { useState, useEffect } from "react";
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

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTodayStatsOpen, setIsTodayStatsOpen] = useState(false);
  const [todayStats, setTodayStats] = useState({ totalAmount: 0, totalCount: 0 });

  const fetchTodayStats = async () => {
    try {
      const response = await fetch("/api/stats/today");
      const data = await response.json();
      setTodayStats({
        totalAmount: data.totalAmount || 0,
        totalCount: data.totalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching sidebar stats:", error);
    }
  };

  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      fetchTodayStats();
    }
  }, [role]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Onboarded Gyms", href: "/dashboard/gyms", icon: Building2, show: role === "SUPER_ADMIN" },
    { name: "Gym Payments", href: "/dashboard/payments", icon: CreditCard, show: role === "SUPER_ADMIN" },
    { name: "Progress", href: "/dashboard/progress", icon: TrendingUp, show: role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "TRAINER" },
    { name: "My Exercises", href: "/dashboard/exercises", icon: CheckCircle2, show: role === "MEMBER" },
    { name: "Requests", href: "/dashboard/requests", icon: Inbox, show: role === "TRAINER" },
    { name: "Booking", href: "/dashboard/booking", icon: CreditCard, show: role === "TRAINER" },
    { name: "Schedule", href: "/dashboard/schedule", icon: TrendingUp, show: role === "TRAINER" },
    { name: "Members", href: "/dashboard/members", icon: Users, show: role === "ADMIN" },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard, show: role === "ADMIN" },
    { name: "Trainers", href: "/dashboard/trainers", icon: Award, show: role === "ADMIN" },
    { name: "Gym Profile", href: "/dashboard/profile", icon: Dumbbell, show: role === "ADMIN" },
    { name: "AI Assistant", icon: MessageSquare, show: role !== "ADMIN" && role !== "SUPER_ADMIN", isAI: true },
    { name: "Book Session", href: "/dashboard/book-session", icon: CheckCircle2, show: role === "MEMBER" },
    { name: "Classes", href: "/dashboard/classes", icon: Award, show: role === "MEMBER" },
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[82vw] max-w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-4 font-sans text-white shadow-2xl transition-transform sm:p-5 md:w-64 md:translate-x-0 md:p-6 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        
        {/* LOGO SECTION */}
        <div className="mb-8 flex items-center gap-2 px-1 sm:mb-10 sm:px-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="text-lg font-black uppercase italic tracking-tight text-white sm:text-xl">
            FlexManage<span className="text-blue-500">Pro</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.show) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.isAI) {
              return (
                <button 
                  key={item.name}
                  onClick={() => setIsAIModalOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 font-medium text-slate-400 transition-all duration-200 hover:bg-slate-900 hover:text-slate-200 sm:px-4"
                >
                  <Icon size={20} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">{item.name}</span>
                </button>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.href || "#"}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-medium transition-all duration-200 sm:px-4 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500"} />
                <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* NAYA SECTION: REAL-TIME COLLECTION DISPLAY */}
        {role === "SUPER_ADMIN" && (
          <div className="mb-4">
            <button 
              onClick={() => setIsTodayStatsOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-blue-500/10 bg-blue-900/20 px-3 py-3 transition-all hover:border-green-500/40 sm:px-4"
            >
              <div className="bg-green-500/20 p-2 rounded-lg group-hover:bg-green-500/30">
                <DollarSign size={18} className="text-green-500" />
              </div>
              <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Today</p>
              <p className="text-xs font-bold italic text-white sm:text-sm">
              PKR {todayStats.totalAmount > 0 ? todayStats.totalAmount.toLocaleString() : "0"}
             </p>
             </div>
            </button>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div className="pt-6 border-t border-slate-900 space-y-1">
          <Link
            href="/dashboard/settings" 
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-900 sm:px-4 ${
              pathname === "/dashboard/settings" ? "text-white bg-slate-900" : "text-slate-500"
            }`}
          >
            <Settings size={20} />
            <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">Settings</span>
          </Link>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-500/70 transition hover:bg-red-500/5 hover:text-red-500 sm:px-4"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase italic tracking-widest sm:text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* MODALS */}
      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <TodayPaymentsModal 
        isOpen={isTodayStatsOpen} 
        stats={todayStats}
        onClose={() => {
          setIsTodayStatsOpen(false);
          fetchTodayStats();
        }} 
      />
    </>
  );
}