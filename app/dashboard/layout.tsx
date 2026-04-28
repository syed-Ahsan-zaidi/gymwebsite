import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-black overflow-hidden">
      {/* Sidebar - Fixed width and won't shrink */}
      <Sidebar />
      
      {/* Main Content Area */}
      {/* FIX: Added 'min-w-0' to allow internal charts to shrink/scroll instead of pushing the layout */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="p-8 overflow-y-auto overflow-x-hidden flex-1">
          <div className="max-w-[1400px] mx-auto w-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
