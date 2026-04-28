"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 1. Hooks import karein
import { createWorkoutPlan } from "../app/actions/trainer-actions";

interface Props {
  memberId: string;
  trainerId: string | null;
}

export default function TrainerPlanForm({ memberId, trainerId }: Props) {
  const router = useRouter(); // 2. Router initialize karein
  const searchParams = useSearchParams(); // 3. URL params pakadne ke liye
  const requestId = searchParams.get("requestId"); // Inbox se aane wali ID

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content) return alert("Please write something first!");
    if (!trainerId) return alert("No trainer assigned to this member!");

    setLoading(true);
    
    // Step A: Plan create karein (Purana logic)
    const res = await createWorkoutPlan(memberId, trainerId, { workoutDetails: content });

    // Step B: AGAR REQUEST ID HAI TO USE STATUS UPDATE KAREIN
    if (res.success && requestId) {
      try {
        await fetch(`/api/requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACTIONED" }),
        });
        console.log("Request status cleared!");
      } catch (err) {
        console.error("Status update failed:", err);
      }
    }

    setLoading(false);

    if (res.success) {
      alert("🚀 Plan created and sent to member!");
      setContent("");
      
      // Step C: Agar request se aaye thay toh wapis Inbox bhej dein
      if (requestId) {
        router.push("/dashboard/requests");
      } else {
        router.refresh();
      }
    } else {
      alert("❌ Error: " + res.error);
    }
  };

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border-2 border-indigo-50 shadow-sm mt-10">
      {/* Indicator dikhane ke liye ke ye request action ho rahi hai */}
      {requestId && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
            ⚡ Actioning Member Request...
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">Assign Workout ✍️</h3>
      </div>

      <textarea 
        className="w-full p-6 bg-gray-50 rounded-[2rem] border-none outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-gray-700 placeholder:text-gray-300 transition-all"
        rows={5}
        value={content}
        placeholder="E.g. Monday: Chest & Triceps. 3 sets of Bench Press (12 reps)..."
        onChange={(e) => setContent(e.target.value)}
      />

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-6 w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-indigo-100 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-black text-white hover:scale-[1.02]"
        }`}
      >
        {loading ? "SAVING..." : "SEND PLAN TO MEMBER"}
      </button>
    </div>
  );
}
