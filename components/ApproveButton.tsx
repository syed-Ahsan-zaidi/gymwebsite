"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!confirm("Kya aapne plan ready kar liya hai?")) return;

    setLoading(true);
    try {
      // Endpoint ko sahi kar diya gaya hai: /api/requests
      const response = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          requestId: requestId, 
          newStatus: "APPROVED" 
        }),
      });

      if (response.ok) {
        // Dashboard ko refresh karega taake pending request list se hat jaye
        router.refresh(); 
      } else {
        const errorData = await response.json();
        alert(`Update fail ho gaya: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Server error! Connection check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className={`px-6 py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-black"
      }`}
    >
      {loading ? "Processing..." : "Mark Done"}
    </button>
  );
}
