"use client";
import { X, TrendingUp, Users } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  stats: { totalAmount: number; totalCount: number };
  onClose: () => void;
}

export default function TodayPaymentsModal({ isOpen, stats, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-950 p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Daily <span className="text-blue-500">Insights</span></h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Today's Performance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          <>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
                  <span className="font-bold text-slate-600 uppercase text-xs tracking-wider">Total Collection</span>
                </div>
                <span className="text-lg font-black text-slate-900 italic">
                  PKR {stats.totalAmount?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg"><Users size={20} className="text-blue-600" /></div>
                  <span className="font-bold text-slate-600 uppercase text-xs tracking-wider">Approved Members</span>
                </div>
                <span className="text-lg font-black text-slate-900 italic">
                  {stats.totalCount < 10 ? `0${stats.totalCount}` : stats.totalCount}
                </span>
              </div>
          </>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
