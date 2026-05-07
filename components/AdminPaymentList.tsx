"use client";

import { useEffect, useState } from "react";
import { approvePaymentAction } from "@/app/actions/payment";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Payment {
  id: string;
  amount: number;
  receiptUrl: string | null;
  memberId: string;
  member: {
    name: string;
    status: string;
  };
}

export default function AdminPaymentList({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Payment[]>(payments);

  useEffect(() => {
    setRows(payments);
  }, [payments]);

  const handleApprove = async () => {
    if (!selectedPayment) return;
    
    setLoading(true);
    try {
      const res = await approvePaymentAction(selectedPayment.id, selectedPayment.memberId);
      if (res.success) {
        alert("Success! Membership has been activated.");
        setRows((prev) => prev.filter((payment) => payment.id !== selectedPayment.id));
        setSelectedPayment(null);
        router.refresh();
      } else {
        alert("Failed to approve. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="p-10 bg-gray-50 rounded-2xl border border-dashed text-center text-gray-400">
          No pending payment requests at the moment.
        </div>
      ) : (
        rows.map((p) => (
          <div 
            key={p.id} 
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                {p.member.name[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{p.member.name}</p>
                <p className="text-sm font-semibold text-green-600">PKR {p.amount.toLocaleString()}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedPayment(p)}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 sm:px-5"
            >
              <Eye size={16} />
              Review
            </button>
          </div>
        ))
      )}

      {/* --- REVIEW MODAL --- */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900">Verify Payment</h3>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircle className="text-gray-400" />
                </button>
              </div>

              {/* Receipt Image Preview */}
              <div className="bg-gray-100 rounded-2xl h-72 mb-6 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
                {selectedPayment.receiptUrl ? (
                  <img 
                    src={selectedPayment.receiptUrl} 
                    alt="Receipt" 
                    className="object-contain h-full w-full p-2" 
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm italic">No screenshot uploaded</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-8 text-center">
                <p className="text-gray-500 text-sm italic">
                  Reviewing payment for <span className="font-bold text-black">{selectedPayment.member.name}</span>
                </p>
                <p className="text-2xl font-black text-gray-900">PKR {selectedPayment.amount.toLocaleString()}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve & Activate
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  disabled={loading}
                  className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
