"use client"
import { useState } from "react";
import { logWeight } from "@/app/actions/analytics";
import { useRouter } from "next/navigation"; // Router import karein

export default function WeightInputForm({ memberId }: { memberId: string }) {
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Router initialize karein

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // parseFloat ensure karta hai ke input decimal support kare
    const res = await logWeight(memberId, parseFloat(weight));
    
    if (res.success) {
      setWeight("");
      // router.refresh() sirf data refresh karega, poora page reload nahi
      router.refresh(); 
      // Aap alert ki jagah toast use karein to zyada professional lagega
      console.log("Weight logged successfully!");
    } else {
      alert("Error: " + res.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      <input
        type="number"
        step="0.1"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-slate-800"
        required
      />
      <button
        type="submit"
        disabled={loading || !weight}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all whitespace-nowrap"
      >
        {loading ? "..." : "Log"}
      </button>
    </form>
  );
}
