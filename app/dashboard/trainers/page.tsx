import prisma from "@/lib/prisma";
import { Contact, Award, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// 1. Pehle yahan component import karein
import DeleteTrainerBtn from "@/components/DeleteTrainerBtn"; 

export default async function TrainersPage() {
  const session = await getServerSession(authOptions);
  const userGymId = (session?.user as any)?.gymId;

  const trainers = await prisma.trainer.findMany({
    where: {
      user: {
        gymId: userGymId,
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-black">
        <h1 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tight">
          Gym Trainers ({trainers.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
          <div className="col-span-full p-10 text-center bg-white rounded-xl border text-slate-400">
            Aapke gym ke liye koi trainer nahi mila.
          </div>
        ) : (
          trainers.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group">
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold text-xl uppercase">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg uppercase italic">{t.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Award size={14} className="text-yellow-500" />Coach
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-medium uppercase text-[10px]">
                    <Contact size={14}/> Specialty
                  </span>
                  <span className="font-bold text-slate-700 uppercase italic">
                    {t.specialization || "Fitness"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2 font-medium uppercase text-[10px]">
                    <UserIcon size={14}/> Active Clients
                  </span>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black italic">
                    {t._count.members} Members
                  </span>
                </div>
              </div>

              {/* 2. Action Buttons Container */}
              <div className="flex gap-2 mt-6">
                <Link href={`/dashboard/trainers/${t.id}`} className="flex-1">
                  <button className="w-full py-2 border border-slate-900 bg-slate-900 text-white rounded-lg text-xs font-black uppercase italic tracking-widest hover:bg-indigo-600 hover:border-indigo-600 transition-all">
                    View Details
                  </button>
                </Link>

                {/* 3. Delete Button Component yahan add kar diya */}
                <DeleteTrainerBtn trainerId={t.id} />
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
