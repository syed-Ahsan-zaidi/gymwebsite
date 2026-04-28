// components/DeleteTrainerBtn.tsx
"use client";

import { deleteTrainer } from "@/app/actions/trainerActions";
import { Trash2 } from "lucide-react";

export default function DeleteTrainerBtn({ trainerId }: { trainerId: string }) {
  const handleDelete = async () => {
    const confirmed = confirm("Kya aap waqai is trainer ko remove karna chahte hain?");
    
    if (confirmed) {
      const result = await deleteTrainer(trainerId);
      if (result.success) {
        alert("Trainer deleted successfully");
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-gray-100"
    >
      <Trash2 size={20} />
    </button>
  );
}
