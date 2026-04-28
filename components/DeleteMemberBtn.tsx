"use client";

import { Trash2 } from "lucide-react";
import { deleteMemberAction } from "@/app/actions/delete-member";
import { useState } from "react";

export default function DeleteMemberBtn({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmDelete = confirm("Kya aap waqai is member ko delete karna chahte hain? Iska saara data khatam ho jayega.");
    
    if (confirmDelete) {
      setLoading(true);
      const res = await deleteMemberAction(userId);
      if (!res.success) alert(res.error);
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-all disabled:opacity-50"
    >
      <Trash2 size={20} />
    </button>
  );
}
