"use client"
import { useState } from "react"
// ✅ Sahi path (Line 4 ko is se replace karein):
import { updateMemberGoalAction } from "../app/actions/member";
import { Edit2, Check, X, Loader2 } from "lucide-react";

export default function GoalEditor({ memberId, initialGoal }: { memberId: string, initialGoal: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);

  const goalOptions = ["Weight Loss", "Muscle Gain", "Bodybuilding", "Cardio Fitness", "Strength Training"];

  const handleSave = async (selectedGoal: string) => {
    if (selectedGoal === goal) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    const res = await updateMemberGoalAction(memberId, selectedGoal);
    if (res.success) {
      setGoal(selectedGoal);
      setIsEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="p-10 bg-indigo-600 rounded-[3rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-center relative group min-h-[180px] overflow-hidden">
      <h3 className="font-black text-white/50 text-[10px] uppercase tracking-widest mb-2">Current Goal</h3>
      
      {isEditing ? (
        <div className="space-y-3 z-10">
          <select 
            className="w-full bg-white text-indigo-900 rounded-2xl p-3 font-bold text-sm outline-none cursor-pointer shadow-lg"
            value={goal}
            onChange={(e) => handleSave(e.target.value)}
            disabled={loading}
            autoFocus
          >
            {goalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button 
            onClick={() => setIsEditing(false)} 
            className="text-[10px] font-black text-white/70 hover:text-white flex items-center gap-1 mx-auto tracking-tighter"
          >
            <X size={12} /> CANCEL
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center group/btn">
          <p className="text-2xl font-black italic tracking-tight leading-tight">{goal}</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-white/10 rounded-2xl hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit2 size={18} />
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-indigo-700/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <Loader2 className="animate-spin mb-2" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Updating...</span>
        </div>
      )}
    </div>
  );
}
