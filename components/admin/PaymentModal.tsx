"use client";

import { useState } from "react";
import { approvePaymentAction } from "@/app/actions/payment";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface PaymentModalProps {
  payment: {
    id: string;
    amount: number;
    transactionId?: string;
    receiptUrl?: string;
    memberId: string;
    member: {
      name: string;
    };
  };
  onClose: () => void;
}

export default function PaymentModal({ payment, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    const confirmApprove = confirm(`Kya aap ${payment.member.name} ki payment approve karna chahte hain?`);
    if (!confirmApprove) return;

    setLoading(true);
    try {
      const result = await approvePaymentAction(payment.id, payment.memberId);
      if (result.success) {
        alert("Member status ACTIVE ho gaya hai! ✅");
        onClose();
        window.location.reload(); // Data refresh karne ke liye
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Kuch masla hua. Console check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-black text-xl text-gray-900 italic uppercase tracking-tighter">Review Payment</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">FlexManage Pro Verification</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Member Info Card */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-zinc-900 rounded-3xl text-white">
            <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-2xl italic border-2 border-white/20 shadow-lg">
              {payment.member.name[0]}
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sender Profile</p>
              <p className="font-bold text-lg leading-tight">{payment.member.name}</p>
            </div>
          </div>

          {/* Screenshot Display Area */}
          <p className="text-[10px] font-black text-zinc-400 uppercase mb-3 tracking-[0.2em] ml-2">Official Receipt Proof</p>
          <div className="relative aspect-video bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 overflow-hidden mb-8 group shadow-inner flex items-center justify-center">
            {payment.receiptUrl ? (
              <img 
                src={payment.receiptUrl} 
                alt="Payment Receipt" 
                className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <AlertCircle size={40} className="mx-auto text-orange-400 animate-pulse" />
                <p className="text-sm text-zinc-400 font-bold italic">No screenshot uploaded yet</p>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-green-50 rounded-3xl border border-green-100 shadow-sm">
              <p className="text-[10px] text-green-600 uppercase font-black tracking-widest mb-1">Fee Amount</p>
              <p className="font-black text-xl text-green-700 italic">PKR {payment.amount}</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Trans ID</p>
              <p className="font-mono text-xs font-bold text-zinc-600 truncate">
                {payment.transactionId || "MANUAL_ENTRY"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApprove}
              disabled={loading || !payment.receiptUrl}
              className="flex-1 bg-zinc-900 hover:bg-orange-600 disabled:bg-zinc-200 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-zinc-200 transition-all duration-300 flex items-center justify-center gap-3 uppercase italic tracking-tighter"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <><CheckCircle size={20} /> Approve & Activate</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-5 bg-zinc-100 text-zinc-500 font-black rounded-[1.5rem] hover:bg-zinc-200 transition-all duration-300 uppercase italic tracking-tighter"
            >
              Back
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
