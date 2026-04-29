import prisma from "@/lib/prisma";
import { Dumbbell, MapPin, Building2, Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Ye line cache khatam karne ke liye zaroori hai
export const dynamic = "force-dynamic";

export default async function GymProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Filter hata kar check karte hain taake Neon ka current data nazar aaye
  const gym = await prisma.gymProfile.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!gym) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Gym profile nahi mili.</h2>
        <p className="text-slate-500 italic">Settings se profile update karein.</p>
      </div>
    );
  }
  

  return (
    <div className="max-w-4xl space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
          Gym <span className="text-indigo-600">Profile</span>
        </h1>
        <Link href="/dashboard/settings" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase hover:bg-indigo-600 transition shadow-lg">
          <Pencil size={12} /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Gym Name & Location */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.2em]">Basic Info</h2>
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{gym.gymName}</p>
              <div className="flex items-center gap-2 text-slate-500 font-bold italic pt-4">
                <MapPin size={16} className="text-rose-500" />
                <span className="text-sm">{gym.location}</span>
              </div>
            </div>
          </div>

          {/* Facilities List */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black mb-8 text-indigo-600 uppercase tracking-[0.2em]">Equipment</h2>
            <div className="flex flex-wrap gap-3">
              {gym.facilities && gym.facilities.length > 0 ? (
                gym.facilities.map((item, index) => (
                  <span key={index} className="bg-slate-50 text-slate-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase border border-slate-100 shadow-sm">
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-slate-400 italic text-xs font-bold uppercase">No facilities listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Stats Sidebar */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl border-b-[8px] border-indigo-600 h-fit">
          <h3 className="font-black text-2xl mb-4 uppercase italic tracking-tighter text-indigo-400">AI READY!</h3>
          <p className="text-slate-400 text-[11px] font-bold leading-relaxed">
            Aapka AI Assistant inhi <span className="text-white text-lg font-black italic">{gym.facilities?.length || 0}</span> machines ko use karke plans suggest kar raha hai.
          </p>
        </div>
      </div>
    </div>
  );
}
