"use client"
import { useState } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";

interface Props {
  memberId: string;
  onClose: () => void;
}

export default function RequestModal({ memberId, onClose }: Props) {
  const [type, setType] = useState("WORKOUT");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!message) return alert("Please add some details!");
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, type, message }),
      });

      if (res.ok) {
        alert("Request sent to your trainer! 🚀");
        onClose();
      }
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={32} strokeWidth={3} />
        </button>

        <div className="mb-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">
            Request <span className="text-indigo-600">Update</span>
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Tell your coach what you need</p>
        </div>

        <div className="space-y-6">
          {/* Type Selector */}
          <div className="flex gap-3 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
            {["WORKOUT", "DIET"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
                  type === t ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Message Area */}
          <textarea
            placeholder="E.g. I want to focus on my strength this week..."
            className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-none outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-gray-700 placeholder:text-slate-300 h-40 transition-all"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>SEND REQUEST <Send size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
