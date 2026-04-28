"use client";
import { useState } from "react";
// Naam change kar diya: markAttendanceAction se markAttendance kar 
import { markAttendance } from "@/app/actions/attendance"; 

export default function CheckInButton({ memberId }: { memberId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleCheckIn = async () => {
    setIsPending(true);
    // Yahan bhi function ka naam theek kar diya
    const result = await markAttendance(memberId);
    
    alert(result.message);
    setIsPending(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
      <h3 className="text-sm font-black text-gray-500 mb-4 uppercase tracking-widest">Attendance</h3>
      <button
        onClick={handleCheckIn}
        disabled={isPending}
        className={`w-full py-4 px-6 rounded-2xl font-black text-white transition-all active:scale-95 ${
          isPending ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
        }`}
      >
        {isPending ? "MARKING..." : "CHECK IN"}
      </button>
      <p className="text-[9px] text-gray-400 mt-3 uppercase font-bold text-center">
        Tap to mark today's entry
      </p>
    </div>
  );
}
