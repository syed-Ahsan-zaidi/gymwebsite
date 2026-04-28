"use client";
import { useState } from "react";
import { getAIAdvice } from "@/app/actions/ai";

export default function AIModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!input.trim() || loading) return; // Khali input bhejane se rokay

    const userMessage = input; // Message ko save karlein
    setLoading(true);
    setInput("");      // <--- YE LINE CHAT KO SAATH SAATH CLEAR KAREGI
    setResponse("");   // Naye sawal ke liye purana jawab clear karein
    
    try {
      const res = await getAIAdvice(userMessage);
      setResponse(res || "Koi jawab nahi mila.");
    } catch (error) {
      setResponse("Coach abhi masroof hai, baad mein try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-indigo-600">FLEX ASSISTANT 🤖</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
          </div>

          <div className="space-y-4">
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 h-32 resize-none font-medium"
              placeholder="E.g. Meri Cardio fitness kaise improve hogi?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            
            <button 
              onClick={handleAsk}
              disabled={loading || !input.trim()}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition disabled:bg-gray-200"
            >
              {loading ? "COACH IS THINKING..." : "ASK NOW"}
            </button>

            {response && (
              <div className="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 max-h-40 overflow-y-auto font-bold text-indigo-900">
                {response}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
