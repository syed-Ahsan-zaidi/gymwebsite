"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL se purani search value uthayein (agar koi hai)
  const [text, setText] = useState(searchParams.get("search") || "");

  // Debounce: Jab user typing rok de, tab URL update ho (400ms ka wait)
  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (text) {
        params.set("search", text);
      } else {
        params.delete("search");
      }
      router.replace(`/dashboard/payments?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delay);
  }, [text, router, searchParams]);

  return (
    <div className="relative max-w-md my-6 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder="Search Branch Name (e.g. Islamabad, Quetta)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-slate-900/40 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-2xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all italic placeholder:text-slate-600 shadow-xl"
      />
    </div>
  );
}
