import prisma from "@/lib/prisma";
import { Building2, History } from "lucide-react";
import Link from "next/link";

export default async function GymsListPage() {
  // Database se gyms fetch karein
  const gyms = await prisma.gymProfile.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Onboarded <span className="text-indigo-600">Gyms</span>
        </h1>
      </div>

      <div className="grid gap-4">
        {gyms.map((gym) => (
          <div key={gym.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Building2 className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic text-slate-800">{gym.gymName}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                   {gym.location} • <span className="text-indigo-600">{gym._count.users} Users</span>
                </p>
              </div>
            </div>

            {/* Logs Button - Ye link karega [gymId] page par */}
           
          </div>
        ))}
      </div>
    </div>
  );
}