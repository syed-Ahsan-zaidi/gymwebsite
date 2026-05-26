"use client";
import { useState, useRef, useEffect } from "react";
import { getTrainerAIAdvice } from "@/app/actions/trainerAi";

type Message = { role: "user" | "ai"; text: string };

export default function TrainerAIModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    try {
      const res = await getTrainerAIAdvice(userMessage);
      setMessages((prev) => [...prev, { role: "ai", text: res || "Koi jawab nahi mila." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "System error, please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col" style={{ height: "600px" }}>

        <div className="flex justify-between items-center px-8 pt-7 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-indigo-600">TRAINER AI 💪</h2>
            <p className="text-xs text-slate-400 mt-0.5">Members, attendance, plans aur classes</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-xs text-slate-400 mt-10">
              Misal: Ali ki attendance kaisi hai? | Mere kitne members active hain?
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium whitespace-pre-line leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none text-sm text-gray-400 font-medium">
                <span className="animate-pulse">AI soch raha hai...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-gray-100 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              className="flex-1 p-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 resize-none font-medium text-sm"
              placeholder="Ask me something..."
              rows={2}
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
              className="bg-indigo-600 text-white font-black px-5 py-3 rounded-2xl hover:bg-indigo-700 transition disabled:bg-gray-200 disabled:text-gray-400 text-sm"
            >
              BHEJO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
