"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteGymAction } from "@/app/actions/gym";
import { useTransition } from "react";

export default function DeleteGymBtn({ gymId }: { gymId: string }) {
  let [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm("🚨 Kya aap waqai is Gym ko delete karna chahte hain? Isse linked saare members aur trainers ka data khatam ho jayega!")) {
      startTransition(async () => {
        await deleteGymAction(gymId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
    >
      {isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
    </button>
  );
}
