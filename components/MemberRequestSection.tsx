"use client"
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import RequestModal from "./RequestModal";

export default function MemberRequestSection({ memberId, requests }: { memberId: string, requests: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if there is any pending request
  const pendingRequest = requests.find(r => r.status === "PENDING");

  return (
    <>
      {/* Request Status Bar */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {requests.map((req) => (
          <div key={req.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            req.status === "PENDING" ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100 opacity-60"
          }`}>
            <span className={`h-2 w-2 rounded-full ${req.status === "PENDING" ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === "PENDING" ? "text-amber-700" : "text-green-700"}`}>
              {req.type}: {req.status}
            </span>
          </div>
        ))}
      </div>

      {/* Request Card */}
      <div className="mt-8 bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-100 transition-all">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:rotate-6 transition-transform">
            <MessageSquare size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Need a New Plan?</h3>
            <p className="text-gray-400 font-bold text-sm">Request your coach for a workout or diet update.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
        >
          {pendingRequest ? "SEND ANOTHER" : "SEND REQUEST"}
        </button>
      </div>

      {isModalOpen && (
        <RequestModal 
          memberId={memberId} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
