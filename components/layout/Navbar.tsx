"use client";

import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

type NavbarProps = {
  onMenuClick?: () => void;
};

const getDisplayName = (name?: string | null, email?: string | null) => {
  if (name && name.trim()) return name.trim();
  if (email && email.includes("@")) return email.split("@")[0];
  return "User";
};

const getInitials = (value: string) => {
  const parts = value.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const name = getDisplayName(session?.user?.name, session?.user?.email);
  const initials = getInitials(name);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="text-sm md:text-xl font-semibold text-slate-800 truncate">
          Welcome back, {name}!
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
