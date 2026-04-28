"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignTrainerDropdown({ memberId, trainers, currentTrainerId }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAssign = async (val: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assign-trainer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, trainerId: val || null }),
      });
      if (res.ok) router.refresh();
      else alert("Error assigning trainer");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <select
        disabled={loading}
        value={currentTrainerId || ""}
        onChange={(e) => handleAssign(e.target.value)}
        className="p-2 border rounded-lg text-sm bg-white text-black outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
      >
        <option value="">Choose Trainer</option>
        {trainers && trainers.length > 0 ? (
          trainers.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))
        ) : (
          <option disabled>No Trainers Found</option>
        )}
      </select>
      {loading && <span className="absolute -bottom-4 left-0 text-[10px] text-blue-500 animate-pulse font-bold">Updating...</span>}
    </div>
  );
}
